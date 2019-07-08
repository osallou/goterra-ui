import React from 'react';
// import { text } from '@fortawesome/fontawesome-svg-core';


export class About extends React.Component {

    render() {
      return (
        <div className="row" style={{textAlign: "left"}}>
            <div className="card col-sm-12">
            <div className="card-header">Terms of use</div>
            <div className="card-body">
                <span>Last updated: 2019-07-04</span>
                <p>Service is free of charge, and used software is open source. It can be install on-premise.</p>
                <p>While no quota is set at the time of this wrinting, quotas may be set in the future, either on service usage itself, or to control access to some remote resources.</p>
            </div>
        </div>
        <div className="card col-sm-12">
            <div className="card-header">Privacy policy</div>
            <div className="card-body">
                <span>Last updated: 2019-07-04</span>
                <p>Genouest core facility ("us", "we", or "our") operates https://goterra.genouest.org/app (the "Site"). This page informs you of our policies regarding the collection, use and disclosure of Personal Information we receive from users of the Site.</p>
                <p>We use your Personal Information only for providing and improving the Site. By using the Site, you agree to the collection and use of information in accordance with this policy.</p>
                <p><strong>Information Collection And Use</strong></p>
                <p>While using our Site, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to your name and email ("Personal Information").</p>
                <p><strong>Log Data</strong></p>
                <p>Like many site operators, we collect information that your browser sends whenever you visit our Site ("Log Data").</p>
                <p>This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics.</p>
                <p><strong>Communications</strong></p>
                <p>We may use your Personal Information to contact you in case of possible abuse of the service or issues found with your account.</p>
                <p><strong>Cookies</strong></p>
                <p>Cookies are files with small amount of data, which may include an anonymous unique identifier. Cookies are sent to your browser from a web site and stored on your computer's hard drive.</p>
                <p>We use cookies only to create a session when you log in, no personal information or usage is recorded.</p>
                <p><strong>Security</strong></p>
                <p>The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage, is 100% secure. While we strive to use acceptable means to protect your Personal Information, we cannot guarantee its absolute security.</p>
                <p>Stored password are encrypted and need a private key to be accessed. During execution, passwords are never written on disk.</p>
                <p><strong>Changes To This Privacy Policy</strong></p>
                <p>This Privacy Policy is effective as of 2019-07-04 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.</p>
                <p>We reserve the right to update or change our Privacy Policy at any time and you should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide and be bound by the modified Privacy Policy.</p>
                <p>If we make any material changes to this Privacy Policy, we will notify you either through the email address you have provided us, or by placing a prominent notice on our website.</p>

            </div>
        </div>
        </div>
      )
    }
  }


