package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	terraConfig "github.com/osallou/goterra-lib/lib/config"
	"github.com/rs/cors"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Version of server
var Version string

// HomeHandler manages base entrypoint, redirect to /app
var HomeHandler = func(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "/app", 301)
}

// ConfigHandler returns web app config
var ConfigHandler = func(w http.ResponseWriter, r *http.Request) {
	config := terraConfig.LoadConfig()

	w.Header().Add("Content-Type", "application/json")
	resp := make(map[string]interface{})
	resp["url"] = config.URL
	resp["acl_user_createns"] = config.ACL.AllowUserCreateNS
	json.NewEncoder(w).Encode(resp)
	return
}

// IndexHandler return default SPA entrypoint index.html
func IndexHandler(entrypoint string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, entrypoint)
	}
	return http.HandlerFunc(fn)
}

func main() {

	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
	if os.Getenv("GOT_DEBUG") != "" {
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	}

	config := terraConfig.LoadConfig()

	consulErr := terraConfig.ConsulDeclare("got-ui", "/app")
	if consulErr != nil {
		log.Error().Msgf("Failed to register: %s", consulErr.Error())
		panic(consulErr)
	}

	r := mux.NewRouter()
	//r.PathPrefix("/app/").Handler(http.StripPrefix("/app/", http.FileServer(http.Dir("./static/build/"))))
	// Pb manifest.json served as index.html if no specific route
	r.PathPrefix("/app/static").Handler(http.StripPrefix("/app/static", http.FileServer(http.Dir("./static/build/static"))))
	r.PathPrefix("/app/manifest.json").HandlerFunc(IndexHandler("./static/build/manifest.json"))
	r.PathPrefix("/app/favicon.ico").HandlerFunc(IndexHandler("./static/build/favicon.ico"))

	r.PathPrefix("/app").HandlerFunc(IndexHandler("./static/build/index.html"))
	r.HandleFunc("/app/config", ConfigHandler).Methods("GET")
	r.HandleFunc("/", HomeHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowedMethods:   []string{"GET"},
	})
	handler := c.Handler(r)

	loggedRouter := handlers.LoggingHandler(os.Stdout, handler)

	srv := &http.Server{
		Handler: loggedRouter,
		Addr:    fmt.Sprintf("%s:%d", config.Web.Listen, config.Web.Port),
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	srv.ListenAndServe()

}
