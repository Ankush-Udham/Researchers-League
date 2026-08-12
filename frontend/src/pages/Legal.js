import { useState } from "react";
import { PageHead } from "../components/shared";

const POLICIES = {
  "Website Policy": `
    1. Purpose and Scope
    Welcome to the IISER Mohali Researchers League platform. This Website Policy outlines the acceptable use of our digital infrastructure, aiming to foster a respectful, secure, and highly functional environment for all student-athletes, researchers, and administrators utilizing this service. By accessing this platform, you agree to abide by the community guidelines and operational standards set forth herein.

    2. Acceptable Use
    This platform is intended strictly for the management, scheduling, and tracking of the IISER Mohali Researchers League. Users are permitted to use the platform to view fixtures, track standings, submit applications via the official widget, and interact with league statistics. You agree to use the platform only for lawful purposes and in a way that does not infringe upon the rights of, restrict, or inhibit anyone else's use and enjoyment of the website. 

    3. Prohibited Activities
    Users are strictly prohibited from engaging in any activity that compromises the integrity or security of the platform. This includes, but is not limited to: attempting to gain unauthorized access to the Admin panel; submitting false, malicious, or spam applications through the application widget; reverse-engineering the platform's backend API; distributing malware; scraping data for unauthorized third-party use; or attempting to manipulate the match scores and ranking algorithms. 

    4. User-Submitted Data
    When utilizing the application widget, users must provide accurate, current, and complete information regarding their academic status (BS-MS, PhD, Int-PhD), current year, and contact details. Submitting offensive, derogatory, or inappropriate language through any interactive form on this platform will result in immediate disqualification from the league and potential reporting to campus administration.

    5. Enforcement and Suspension
    The Administration reserves the right to monitor platform usage to ensure compliance with this policy. We reserve the right to temporarily or permanently suspend access to the platform for any user found violating these terms, without prior notice.

    6. Modifications to the Policy
    The Administration reserves the right to update or modify this Website Policy at any time to reflect changes in our operational procedures or security requirements. Continued use of the platform following any modifications indicates your acceptance of the revised policy.
  `,
  "Terms of Use": `
    1. Acceptance of Terms
    By accessing, browsing, or utilizing the IISER Mohali Researchers League website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree to these terms, you must refrain from using the platform.

    2. Description of Service
    The platform provides digital sports management tools, including automated fixture generation, real-time standing calculations, player rosters, and league announcements. The service is provided "as is" and "as available" for the IISER Mohali community. The Administration makes no guarantees regarding the uninterrupted availability of the platform.

    3. Administrative Authority
    The League Administrator retains absolute authority over the platform's content, including but not limited to: team creation, match scheduling, score validation, and player assignment. The Administrator's decisions regarding dispute resolution in match scores or standings are final and binding.

    4. Code of Conduct and Sportsmanship
    While this platform is digital, it represents physical sporting events. All users must uphold the highest standards of sportsmanship. Any disputes regarding physical matches must be handled respectfully and reported to the Administrator. The digital platform must not be used as a medium for harassment, bullying, or unsportsmanlike behavior.

    5. Limitation of Liability
    To the maximum extent permitted by applicable law, the developers, administrators, and affiliated entities of the IISER Mohali Researchers League shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, or use of, the platform. This includes, but is not limited to, data loss, application errors, or miscalculated standings resulting from technical faults.

    6. Governing Law and Jurisdiction
    These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Sahibzada Ajit Singh Nagar, Punjab, India. 
  `,
  "Privacy Policy": `
    1. Introduction
    The IISER Mohali Researchers League respects your privacy and is committed to protecting the personal data of our players, students, and website visitors. This Privacy Policy details how we collect, use, process, and safeguard your information when you interact with our platform.

    2. Information We Collect
    We collect information directly from you when you voluntarily submit it through our platform. When you apply for sports via our Application Widget, we collect your Full Name, Academic Program (BS-MS, PhD, Int-PhD), Current Year, Phone Number, and your stated Sports Interests. For rostered players, we display your name, team affiliation, and optionally your photograph and biography.

    3. How We Use Your Information
    The data collected is utilized exclusively for the administration and operation of the sports league. Specifically, we use your contact information to notify you regarding team placements, fixture schedules, and league updates. Application data is emailed directly to the Administrator's secure inbox (ankushudham24@gmail.com) and stored in our secure database for organizational purposes.

    4. Data Sharing and Disclosure
    We categorically do not sell, rent, or trade your personal information to third parties, marketers, or external organizations. Your data is kept strictly within the administrative purview of the IISER Mohali Researchers League. Limited data (such as player names and team affiliations) is made publicly visible on the platform to facilitate league operations and leaderboards.

    5. Data Security Measures
    We implement robust security measures to maintain the safety of your personal information. Our platform utilizes secure server hosting (Render/Vercel) and encrypted communication protocols (HTTPS) to protect against unauthorized access, alteration, or destruction of your data.

    6. Your Data Rights
    You maintain the right to request access to, correction of, or deletion of your personal data stored on our platform. If you wish to have your player profile removed or your application data deleted, please contact the Administrator directly. We will process all such requests promptly in accordance with applicable data protection guidelines.
  `,
  "Copyright Policy": `
    1. Ownership of Content
    All original content, features, and functionality present on this platform—including but not limited to the underlying codebase, structural design, visual aesthetics, proprietary logos, and textual content—are the exclusive property of the IISER Mohali Researchers League and its developers. This property is protected by international copyright, trademark, and other intellectual property laws.

    2. Limited License
    Users are granted a limited, non-exclusive, non-transferable, and revocable license to access and use the platform for its intended purpose: interacting with the campus sports league. You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our website without prior written consent from the Administration.

    3. User-Generated Content
    By submitting content to the platform (e.g., player biographies, application details, team names), you grant the IISER Mohali Researchers League a perpetual, irrevocable, worldwide, royalty-free license to use, display, and distribute said content strictly within the context of operating the sports league. 

    4. Third-Party Trademarks
    Any references to specific sports equipment, third-party software (such as React, Vercel, MongoDB), or external institutions are the property of their respective owners. Use of these names does not imply endorsement.

    5. Copyright Infringement Claims
    We respect the intellectual property rights of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please provide the Administrator with a written notice containing: a description of the copyrighted work; a description of where the alleged infringing material is located on the site; and your contact information. 

    6. Contact for Legal Inquiries
    For all inquiries regarding intellectual property, usage rights, or to submit a notice of copyright infringement, please contact the League Administrator directly via email at ankushudham24@gmail.com. We are committed to resolving all intellectual property disputes rapidly and amicably.
  `
};

export default function Legal() {
  const [activeTab, setActiveTab] = useState("Privacy Policy");

  return (
    <div className="min-h-screen">
      <PageHead label="Legal & Compliance" title="POLICIES" accent="#FF3B30" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-6 mb-8">
          {Object.keys(POLICIES).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-colors border ${
                activeTab === tab 
                  ? "bg-[#FF3B30] border-[#FF3B30] text-white" 
                  : "bg-[#141414] border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="card-tech rounded-2xl p-8 sm:p-12">
          <h2 className="font-display text-4xl text-white mb-8 border-b border-white/10 pb-4">{activeTab}</h2>
          
          <div className="space-y-6 text-zinc-300 leading-relaxed text-sm sm:text-base whitespace-pre-line">
            {POLICIES[activeTab].split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph.trim()}</p>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/10 text-xs text-zinc-500">
            Last updated: August 2026. For questions regarding these policies, contact ankushudham24@gmail.com.
          </div>
        </div>

      </div>
    </div>
  );
}
