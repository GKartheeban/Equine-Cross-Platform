// EquineTrade Terms of Use, in English and Tamil.
// Shown at /terms. To change the wording, edit the text below.
// Before launch: fill in the Grievance Officer details in src/content/legal.ts
// (the city there is also the city whose courts handle disputes, section 15).

import { SITE_URL } from "@/lib/site";
import { GRIEVANCE_OFFICER, type LegalDocument } from "@/content/legal";

/** Change this date whenever the terms change. */
export const LAST_UPDATED = "2026-10-13";

const SITE = new URL(SITE_URL).host;
const G = GRIEVANCE_OFFICER;

const en: LegalDocument = {
  title: "Terms of Use",
  lastUpdated: "Last updated",
  contentsTitle: "Contents",
  intro: [
    {
      p: "Please read these Terms of Use carefully before using EquineTrade. They explain the rules for using the Website, what we are and are not responsible for, and what we expect from every Buyer and Seller.",
    },
  ],
  sections: [
    {
      id: "acceptance",
      title: "1. About these Terms",
      blocks: [
        {
          clauses: [
            {
              n: "1.1",
              text: `These Terms of Use (the “Terms”) are a legal agreement between you and EquineTrade (“EquineTrade”, “we”, “us” or “our”). They govern your access to and use of the website ${SITE} (the “Website”).`,
            },
            {
              n: "1.2",
              text: "By visiting the Website, creating an account, or posting or responding to a Listing, you agree to these Terms and to our Privacy Policy. If you do not agree, you must not use the Website.",
            },
            {
              n: "1.3",
              text: "These Terms are published in accordance with the Information Technology Act, 2000 and the rules made under it, including the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021. They are an electronic record and do not require any physical or digital signature.",
            },
          ],
        },
      ],
    },
    {
      id: "definitions",
      title: "2. Definitions",
      blocks: [
        { p: "In these Terms:" },
        {
          list: [
            { label: "“Buyer”", text: "means a User who views a Listing or contacts a Seller." },
            {
              label: "“Content”",
              text: "means any text, photograph, video, document or other material posted on the Website.",
            },
            { label: "“Listing”", text: "means an advertisement for a horse posted on the Website." },
            { label: "“Seller”", text: "means a User who posts a Listing." },
            {
              label: "“User” or “you”",
              text: "means any person who visits or uses the Website, with or without an account.",
            },
          ],
        },
      ],
    },
    {
      id: "our-role",
      title: "3. Our role",
      blocks: [
        {
          clauses: [
            {
              n: "3.1",
              text: "EquineTrade is an online classifieds platform. We only provide a place where Sellers can advertise horses and Buyers can find and contact them.",
            },
            {
              n: "3.2",
              text: "We are not the owner, seller, buyer, broker or agent of any horse on the Website. We do not take part in, and are not a party to, any negotiation, sale, payment, transport or handover between Users.",
            },
            {
              n: "3.3",
              text: "We do not inspect or verify any horse. We do not guarantee the accuracy of any Listing; the health, age, breed, quality or legal status of any horse; or the identity, honesty or ability of any User to complete a transaction.",
            },
            {
              n: "3.4",
              text: "As an intermediary under the Information Technology Act, 2000, we are not responsible for Content posted by Users. However, we act on complaints and remove unlawful Content as described in these Terms.",
            },
          ],
        },
      ],
    },
    {
      id: "accounts",
      title: "4. Eligibility and accounts",
      blocks: [
        {
          clauses: [
            {
              n: "4.1",
              text: "You must be at least 18 years old and legally able to enter into a binding contract under Indian law to create an account or post a Listing.",
            },
            {
              n: "4.2",
              text: "You must register with your own Indian mobile number and give accurate information. You must not create an account for another person or pretend to be someone else.",
            },
            {
              n: "4.3",
              text: "You are responsible for keeping your password and recovery code confidential, and for all activity under your account. Tell us immediately if you believe someone else has used your account.",
            },
            {
              n: "4.4",
              text: "We may refuse registration, or suspend or close any account, as described in section 10.",
            },
          ],
        },
      ],
    },
    {
      id: "sellers",
      title: "5. Rules for Sellers",
      blocks: [
        {
          clauses: [
            {
              n: "5.1",
              text: "When you post a Listing, you confirm that:",
              items: [
                "you own the horse, or the owner has authorised you to sell it;",
                "the horse is not stolen, pledged or the subject of any legal dispute;",
                "all details, photographs and videos are true, current and of the horse being offered;",
                "the health, age, training and other information you give is honest to the best of your knowledge, and you have disclosed any known illness, injury, pregnancy or behavioural problem; and",
                "you own, or have permission to use, all the Content you upload.",
              ],
            },
            {
              n: "5.2",
              text: "You must keep each Listing up to date, and mark it as sold or delete it as soon as the horse is no longer available.",
            },
            {
              n: "5.3",
              text: "You alone are responsible for complying with every law that applies to the sale, care and transport of your horse, including the Prevention of Cruelty to Animals Act, 1960 and the rules made under it, and any veterinary or health-certificate requirements of the Government of Tamil Nadu.",
            },
            {
              n: "5.4",
              text: "To prevent spam, we may limit the number of Listings a Seller can post in a day.",
            },
            {
              n: "5.5",
              text: "Posting a Listing is currently free. We may introduce paid features in the future, and we will tell you clearly before any charge applies.",
            },
          ],
        },
      ],
    },
    {
      id: "buyers",
      title: "6. Advice for Buyers",
      blocks: [
        {
          clauses: [
            {
              n: "6.1",
              text: "Before you pay any money or take delivery, see the horse in person, check its documents and, wherever possible, have it examined by a qualified veterinarian.",
            },
            {
              n: "6.2",
              text: "Never pay an advance, deposit or token amount to someone you have not met, or for a horse you have not seen. EquineTrade never collects payments on behalf of Sellers and will never ask you to pay through the Website.",
            },
            {
              n: "6.3",
              text: "Any agreement you make with a Seller is solely between you and that Seller.",
            },
            {
              n: "6.4",
              text: "You may use a Seller's contact details only to ask about their Listing. You must not use them for spam, marketing or harassment.",
            },
          ],
        },
      ],
    },
    {
      id: "prohibited",
      title: "7. Prohibited content and conduct",
      blocks: [
        { p: "You must not post any Content, or do anything on or through the Website, that:" },
        {
          lettered: [
            "is false, misleading or fraudulent, including fake Listings, Listings for horses you do not have, or prices meant only to attract calls;",
            "offers any animal other than a horse, or any goods or services not connected with the sale of a horse;",
            "offers a horse that is stolen, or whose sale, transport or use is prohibited by law;",
            "promotes cruelty to animals, illegal racing or betting, or the use of banned substances on animals;",
            "uses photographs or videos that are not your own or not of the horse being offered, or infringes anyone's copyright, trademark or other rights;",
            "is obscene, defamatory, abusive, hateful, threatening, or harmful to children;",
            "impersonates any person, or misrepresents your identity or your connection with any person;",
            "reveals the personal details of another person without their permission;",
            "contains viruses or harmful code, or attempts to hack, overload or disrupt the Website, or to access data you are not permitted to see;",
            "uses bots, scripts or other automated means to post Listings or to collect information from the Website;",
            "threatens the unity, integrity, defence, security or sovereignty of India, friendly relations with foreign States, or public order; or",
            "otherwise violates any law for the time being in force in India.",
          ],
        },
      ],
    },
    {
      id: "content",
      title: "8. Your content",
      blocks: [
        {
          clauses: [
            { n: "8.1", text: "You keep ownership of the Content you post." },
            {
              n: "8.2",
              text: "By posting Content, you grant EquineTrade a non-exclusive, royalty-free, worldwide licence to host, store, copy, resize, display and share it on the Website, and to use it to promote the Website, for as long as it remains on the Website.",
            },
            {
              n: "8.3",
              text: "You are responsible for your Content. We may resize or compress photographs and videos, and we may refuse or remove any Content at our discretion, without notice.",
            },
          ],
        },
      ],
    },
    {
      id: "reporting",
      title: "9. Reporting and complaints",
      blocks: [
        {
          clauses: [
            {
              n: "9.1",
              text: "Any User may report a Listing using the “Report this listing” link on its page. We review every report and remove Listings that break these Terms.",
            },
            {
              n: "9.2",
              text: "Complaints about any Content, including complaints that it infringes your rights, may be sent to our Grievance Officer (section 16). We will acknowledge a complaint within 24 hours and aim to resolve it within 15 days. Where the law requires faster action, we will act within the time it requires.",
            },
            {
              n: "9.3",
              text: "We will remove or disable access to Content when we receive a court order, or a lawful notice from the appropriate Government or its agency, within the time required by law.",
            },
          ],
        },
      ],
    },
    {
      id: "termination",
      title: "10. Suspension and termination",
      blocks: [
        {
          clauses: [
            {
              n: "10.1",
              text: "We may, at our discretion and without prior notice, remove any Listing, or suspend or permanently close any account, if we reasonably believe that a User has broken these Terms or the law, or if this is necessary to protect other Users or EquineTrade.",
            },
            {
              n: "10.2",
              text: "You may stop using the Website at any time, and delete your Listings or your whole account yourself from My profile.",
            },
            {
              n: "10.3",
              text: "Sections 8, 11, 12, 13 and 15 continue to apply after your account is closed.",
            },
          ],
        },
      ],
    },
    {
      id: "disclaimers",
      title: "11. Disclaimers",
      blocks: [
        {
          clauses: [
            {
              n: "11.1",
              text: "The Website is provided on an “as is” and “as available” basis. We do not promise that it will always be available, uninterrupted, error-free or secure.",
            },
            {
              n: "11.2",
              text: "To the extent permitted by law, we make no warranties of any kind, express or implied, about the Website, any Listing or any horse.",
            },
            {
              n: "11.3",
              text: "Information on the Website, such as breed descriptions and safety tips, is general in nature and is not veterinary, legal or financial advice.",
            },
          ],
        },
      ],
    },
    {
      id: "liability",
      title: "12. Limitation of liability",
      blocks: [
        {
          clauses: [
            {
              n: "12.1",
              text: "To the fullest extent permitted by law, EquineTrade, its founders, team members and service providers will not be liable for any loss or damage arising out of or in connection with:",
              items: [
                "any dealing or transaction between Users, including payment, delivery, or the condition, health, injury, death or behaviour of any horse;",
                "any Content posted by Users;",
                "any loss of data, profit, business or goodwill, or any indirect or consequential loss; or",
                "the Website being unavailable, or any error, virus or security breach.",
              ],
            },
            {
              n: "12.2",
              text: "If EquineTrade is nevertheless found liable to you, our total liability will not exceed ₹1,000 (one thousand Indian rupees) or the total amount you have paid us in the twelve months before the claim, whichever is higher.",
            },
            {
              n: "12.3",
              text: "Nothing in these Terms limits any liability that cannot be limited under applicable law.",
            },
          ],
        },
      ],
    },
    {
      id: "indemnity",
      title: "13. Indemnity",
      blocks: [
        {
          p: "You agree to indemnify and hold harmless EquineTrade, its founders, team members and service providers against any claim, loss, damage or cost (including reasonable legal fees) arising out of your Content, your use of the Website, your dealings with other Users, or your breach of these Terms or of any law.",
        },
      ],
    },
    {
      id: "changes",
      title: "14. Changes to the Website and these Terms",
      blocks: [
        {
          clauses: [
            {
              n: "14.1",
              text: "We may change, suspend or discontinue any part of the Website at any time.",
            },
            {
              n: "14.2",
              text: "We may update these Terms from time to time. We will change the “Last updated” date at the top, and we will show a notice on the Website for important changes. If you continue to use the Website after a change, you accept the updated Terms.",
            },
          ],
        },
      ],
    },
    {
      id: "governing-law",
      title: "15. Governing law and disputes",
      blocks: [
        {
          clauses: [
            { n: "15.1", text: "These Terms are governed by the laws of India." },
            {
              n: "15.2",
              text: "If you have a dispute with us, please first contact our Grievance Officer so that we can try to resolve it amicably.",
            },
            {
              n: "15.3",
              text: `Subject to the above, the courts at ${G.city}, Tamil Nadu shall have exclusive jurisdiction over any dispute arising out of or in connection with these Terms or the Website.`,
            },
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "16. Grievance Officer and contact",
      blocks: [
        {
          p: "For any question or complaint about these Terms, a Listing or any other Content, please contact our Grievance Officer:",
        },
        {
          list: [
            { label: "Name:", text: G.name },
            { label: "Email:", text: G.email },
            { label: "Address:", text: `${G.city}, Tamil Nadu, India` },
          ],
        },
      ],
    },
    {
      id: "general",
      title: "17. General",
      blocks: [
        {
          clauses: [
            {
              n: "17.1",
              text: "These Terms, together with our Privacy Policy, form the entire agreement between you and EquineTrade about the Website.",
            },
            {
              n: "17.2",
              text: "If any part of these Terms is found to be invalid or unenforceable, the remaining parts will continue in full force.",
            },
            {
              n: "17.3",
              text: "If we do not enforce any right under these Terms, that does not mean we have given it up.",
            },
            {
              n: "17.4",
              text: "You may not transfer your rights or obligations under these Terms. We may transfer ours to any organisation that takes over the Website.",
            },
            {
              n: "17.5",
              text: "These Terms are provided in English and Tamil. If the two versions differ in meaning, the English version will apply.",
            },
          ],
        },
      ],
    },
  ],
};

const ta: LegalDocument = {
  title: "பயன்பாட்டு விதிமுறைகள்",
  lastUpdated: "கடைசியாகப் புதுப்பிக்கப்பட்டது",
  contentsTitle: "பொருளடக்கம்",
  intro: [
    {
      p: "EquineTrade-ஐப் பயன்படுத்துவதற்கு முன், இந்தப் பயன்பாட்டு விதிமுறைகளைக் கவனமாகப் படியுங்கள். இணையதளத்தைப் பயன்படுத்துவதற்கான விதிகள், நாங்கள் எவற்றுக்குப் பொறுப்பு, எவற்றுக்குப் பொறுப்பல்ல, ஒவ்வொரு வாங்குபவரிடமும் விற்பனையாளரிடமும் நாங்கள் எதிர்பார்ப்பவை ஆகியவற்றை இவை விளக்குகின்றன.",
    },
  ],
  sections: [
    {
      id: "acceptance",
      title: "1. இந்த விதிமுறைகள் பற்றி",
      blocks: [
        {
          clauses: [
            {
              n: "1.1",
              text: `இந்தப் பயன்பாட்டு விதிமுறைகள் (“விதிமுறைகள்”) உங்களுக்கும் EquineTrade-க்கும் (“EquineTrade”, “நாங்கள்”, “எங்கள்”) இடையிலான சட்டப்பூர்வ ஒப்பந்தமாகும். ${SITE} இணையதளத்தை (“இணையதளம்”) நீங்கள் அணுகுவதையும் பயன்படுத்துவதையும் இவை நெறிப்படுத்துகின்றன.`,
            },
            {
              n: "1.2",
              text: "இணையதளத்தைப் பார்வையிடுவதன் மூலமோ, கணக்கை உருவாக்குவதன் மூலமோ, ஒரு பதிவை இடுவதன் அல்லது அதற்குப் பதிலளிப்பதன் மூலமோ, இந்த விதிமுறைகளையும் எங்கள் தனியுரிமைக் கொள்கையையும் நீங்கள் ஏற்றுக்கொள்கிறீர்கள். நீங்கள் ஏற்றுக்கொள்ளவில்லை எனில், இணையதளத்தைப் பயன்படுத்தக் கூடாது.",
            },
            {
              n: "1.3",
              text: "தகவல் தொழில்நுட்பச் சட்டம், 2000 மற்றும் அதன் கீழ் வகுக்கப்பட்ட விதிகள் — தகவல் தொழில்நுட்ப (இடைநிலையாளர் வழிகாட்டுதல்கள் மற்றும் டிஜிட்டல் ஊடக நெறிமுறைக் குறியீடு) விதிகள், 2021 உட்பட — ஆகியவற்றுக்கு இணங்க இந்த விதிமுறைகள் வெளியிடப்படுகின்றன. இவை ஒரு மின்னணு ஆவணம்; இவற்றுக்கு நேரடி அல்லது டிஜிட்டல் கையொப்பம் எதுவும் தேவையில்லை.",
            },
          ],
        },
      ],
    },
    {
      id: "definitions",
      title: "2. வரையறைகள்",
      blocks: [
        { p: "இந்த விதிமுறைகளில்:" },
        {
          list: [
            { label: "“வாங்குபவர்”", text: "என்பது ஒரு பதிவைப் பார்க்கும் அல்லது விற்பனையாளரைத் தொடர்புகொள்ளும் பயனரைக் குறிக்கும்." },
            {
              label: "“உள்ளடக்கம்”",
              text: "என்பது இணையதளத்தில் இடப்படும் எழுத்து, புகைப்படம், வீடியோ, ஆவணம் அல்லது பிற எந்தப் பொருளையும் குறிக்கும்.",
            },
            { label: "“பதிவு”", text: "என்பது இணையதளத்தில் இடப்படும், ஒரு குதிரைக்கான விளம்பரத்தைக் குறிக்கும்." },
            { label: "“விற்பனையாளர்”", text: "என்பது ஒரு பதிவை இடும் பயனரைக் குறிக்கும்." },
            {
              label: "“பயனர்” அல்லது “நீங்கள்”",
              text: "என்பது கணக்குடனோ கணக்கு இல்லாமலோ இணையதளத்தைப் பார்வையிடும் அல்லது பயன்படுத்தும் எவரையும் குறிக்கும்.",
            },
          ],
        },
      ],
    },
    {
      id: "our-role",
      title: "3. எங்கள் பங்கு",
      blocks: [
        {
          clauses: [
            {
              n: "3.1",
              text: "EquineTrade ஓர் இணைய வகைப்படுத்தப்பட்ட விளம்பரத் தளம். விற்பனையாளர்கள் குதிரைகளை விளம்பரப்படுத்தவும், வாங்குபவர்கள் அவற்றைக் கண்டறிந்து தொடர்புகொள்ளவும் ஓர் இடத்தை மட்டுமே நாங்கள் வழங்குகிறோம்.",
            },
            {
              n: "3.2",
              text: "இணையதளத்தில் உள்ள எந்தக் குதிரைக்கும் நாங்கள் உரிமையாளரோ, விற்பவரோ, வாங்குபவரோ, தரகரோ, முகவரோ அல்ல. பயனர்களுக்கு இடையிலான பேச்சுவார்த்தை, விற்பனை, பணப் பரிவர்த்தனை, போக்குவரத்து அல்லது ஒப்படைப்பு எதிலும் நாங்கள் பங்கேற்பதில்லை; அவற்றில் நாங்கள் ஒரு தரப்பும் அல்ல.",
            },
            {
              n: "3.3",
              text: "எந்தக் குதிரையையும் நாங்கள் ஆய்வு செய்வதோ சரிபார்ப்பதோ இல்லை. எந்தப் பதிவின் துல்லியத்திற்கும்; எந்தக் குதிரையின் உடல்நலம், வயது, இனம், தரம் அல்லது சட்டப்பூர்வ நிலைக்கும்; எந்தப் பயனரின் அடையாளம், நேர்மை அல்லது பரிவர்த்தனையை முடிக்கும் திறனுக்கும் நாங்கள் உத்தரவாதம் அளிப்பதில்லை.",
            },
            {
              n: "3.4",
              text: "தகவல் தொழில்நுட்பச் சட்டம், 2000-இன் கீழ் ஓர் இடைநிலையாளராக, பயனர்கள் இடும் உள்ளடக்கத்திற்கு நாங்கள் பொறுப்பல்ல. எனினும், இந்த விதிமுறைகளில் விவரிக்கப்பட்டுள்ளபடி புகார்களின் மீது நடவடிக்கை எடுத்து, சட்டவிரோதமான உள்ளடக்கத்தை நீக்குகிறோம்.",
            },
          ],
        },
      ],
    },
    {
      id: "accounts",
      title: "4. தகுதியும் கணக்குகளும்",
      blocks: [
        {
          clauses: [
            {
              n: "4.1",
              text: "கணக்கை உருவாக்கவோ பதிவை இடவோ, உங்களுக்குக் குறைந்தது 18 வயது நிரம்பியிருக்க வேண்டும்; இந்தியச் சட்டப்படி கட்டுப்படுத்தும் ஒப்பந்தத்தில் ஈடுபடச் சட்டப்பூர்வத் தகுதியும் இருக்க வேண்டும்.",
            },
            {
              n: "4.2",
              text: "உங்களுடைய சொந்த இந்திய மொபைல் எண்ணைக் கொண்டு பதிவு செய்து, துல்லியமான தகவல்களை வழங்க வேண்டும். வேறொருவருக்காகக் கணக்கை உருவாக்கவோ, வேறொருவர் போல நடிக்கவோ கூடாது.",
            },
            {
              n: "4.3",
              text: "உங்கள் கடவுச்சொல்லையும் மீட்புக் குறியீட்டையும் ரகசியமாக வைத்திருப்பதற்கும், உங்கள் கணக்கில் நடைபெறும் அனைத்துச் செயல்பாடுகளுக்கும் நீங்களே பொறுப்பு. உங்கள் கணக்கை வேறொருவர் பயன்படுத்தியதாக நீங்கள் கருதினால், உடனடியாக எங்களுக்குத் தெரிவியுங்கள்.",
            },
            {
              n: "4.4",
              text: "பிரிவு 10-இல் விவரிக்கப்பட்டுள்ளபடி, பதிவு செய்வதை மறுக்கவோ, எந்தக் கணக்கையும் இடைநிறுத்தவோ மூடவோ எங்களுக்கு உரிமை உண்டு.",
            },
          ],
        },
      ],
    },
    {
      id: "sellers",
      title: "5. விற்பனையாளர்களுக்கான விதிகள்",
      blocks: [
        {
          clauses: [
            {
              n: "5.1",
              text: "நீங்கள் ஒரு பதிவை இடும்போது, பின்வருவனவற்றை உறுதிப்படுத்துகிறீர்கள்:",
              items: [
                "நீங்களே குதிரையின் உரிமையாளர், அல்லது அதை விற்க உரிமையாளர் உங்களுக்கு அதிகாரம் அளித்துள்ளார்;",
                "குதிரை திருடப்பட்டதோ, அடமானம் வைக்கப்பட்டதோ, எந்தச் சட்டச் சர்ச்சைக்கும் உட்பட்டதோ அல்ல;",
                "அனைத்து விவரங்களும் புகைப்படங்களும் வீடியோக்களும் உண்மையானவை, தற்போதையவை, விற்பனைக்கு வழங்கப்படும் அதே குதிரையுடையவை;",
                "நீங்கள் வழங்கும் உடல்நலம், வயது, பயிற்சி மற்றும் பிற தகவல்கள் உங்களுக்குத் தெரிந்தவரை நேர்மையானவை; உங்களுக்குத் தெரிந்த நோய், காயம், கருவுற்ற நிலை அல்லது நடத்தைச் சிக்கல் எதையும் வெளிப்படுத்தியுள்ளீர்கள்; மேலும்",
                "நீங்கள் பதிவேற்றும் உள்ளடக்கம் அனைத்தும் உங்களுக்குச் சொந்தமானவை, அல்லது அவற்றைப் பயன்படுத்த உங்களுக்கு அனுமதி உள்ளது.",
              ],
            },
            {
              n: "5.2",
              text: "ஒவ்வொரு பதிவையும் புதுப்பித்த நிலையில் வைத்திருக்க வேண்டும்; குதிரை இனி கிடைக்காத நிலையில், உடனடியாக அதை விற்கப்பட்டதாகக் குறிக்க வேண்டும் அல்லது நீக்க வேண்டும்.",
            },
            {
              n: "5.3",
              text: "உங்கள் குதிரையின் விற்பனை, பராமரிப்பு, போக்குவரத்து ஆகியவற்றுக்குப் பொருந்தும் அனைத்துச் சட்டங்களுக்கும் — விலங்குகள் வதைத் தடுப்புச் சட்டம், 1960 மற்றும் அதன் கீழ் வகுக்கப்பட்ட விதிகள், தமிழ்நாடு அரசின் கால்நடை மருத்துவ அல்லது உடல்நலச் சான்றிதழ் தேவைகள் உட்பட — இணங்கி நடப்பது உங்கள் பொறுப்பு மட்டுமே.",
            },
            {
              n: "5.4",
              text: "தேவையற்ற பதிவுகளைத் தடுக்க, ஒரு விற்பனையாளர் ஒரு நாளில் இடக்கூடிய பதிவுகளின் எண்ணிக்கைக்கு நாங்கள் வரம்பு விதிக்கலாம்.",
            },
            {
              n: "5.5",
              text: "பதிவை இடுவது தற்போது இலவசம். எதிர்காலத்தில் கட்டண வசதிகளை அறிமுகப்படுத்தக்கூடும்; எந்தக் கட்டணமும் பொருந்துவதற்கு முன் அதை உங்களுக்குத் தெளிவாகத் தெரிவிப்போம்.",
            },
          ],
        },
      ],
    },
    {
      id: "buyers",
      title: "6. வாங்குபவர்களுக்கான அறிவுரைகள்",
      blocks: [
        {
          clauses: [
            {
              n: "6.1",
              text: "எந்தப் பணத்தையும் செலுத்துவதற்கு அல்லது குதிரையைப் பெற்றுக்கொள்வதற்கு முன், குதிரையை நேரில் பாருங்கள்; அதன் ஆவணங்களைச் சரிபாருங்கள்; முடிந்தவரை, தகுதியுள்ள கால்நடை மருத்துவரைக் கொண்டு அதைப் பரிசோதியுங்கள்.",
            },
            {
              n: "6.2",
              text: "நீங்கள் சந்திக்காத ஒருவருக்கோ, நீங்கள் பார்க்காத குதிரைக்கோ முன்பணம், வைப்புத்தொகை அல்லது டோக்கன் தொகை எதையும் ஒருபோதும் செலுத்த வேண்டாம். EquineTrade விற்பனையாளர்கள் சார்பாக எந்தப் பணத்தையும் வசூலிப்பதில்லை; இணையதளம் வழியாகப் பணம் செலுத்துமாறு உங்களிடம் ஒருபோதும் கேட்காது.",
            },
            {
              n: "6.3",
              text: "ஒரு விற்பனையாளருடன் நீங்கள் செய்துகொள்ளும் எந்த ஒப்பந்தமும் உங்களுக்கும் அந்த விற்பனையாளருக்கும் இடையிலானது மட்டுமே.",
            },
            {
              n: "6.4",
              text: "ஒரு விற்பனையாளரின் தொடர்பு விவரங்களை, அவருடைய பதிவைப் பற்றிக் கேட்பதற்கு மட்டுமே பயன்படுத்தலாம். தேவையற்ற செய்திகள், சந்தைப்படுத்தல் அல்லது தொந்தரவு செய்வதற்கு அவற்றைப் பயன்படுத்தக் கூடாது.",
            },
          ],
        },
      ],
    },
    {
      id: "prohibited",
      title: "7. தடைசெய்யப்பட்ட உள்ளடக்கமும் நடத்தையும்",
      blocks: [
        { p: "பின்வரும் தன்மையுடைய எந்த உள்ளடக்கத்தையும் நீங்கள் இடக் கூடாது; இணையதளத்தில் அல்லது அதன் வழியாக அத்தகைய எதையும் செய்யக் கூடாது:" },
        {
          lettered: [
            "பொய்யான, தவறாக வழிநடத்தும் அல்லது மோசடியான உள்ளடக்கம் — போலிப் பதிவுகள், உங்களிடம் இல்லாத குதிரைகளுக்கான பதிவுகள், அழைப்புகளை ஈர்ப்பதற்காக மட்டுமே காட்டப்படும் விலைகள் உட்பட;",
            "குதிரை அல்லாத வேறு எந்த விலங்கையும், அல்லது குதிரை விற்பனையுடன் தொடர்பில்லாத பொருட்கள் அல்லது சேவைகளையும் விற்பனைக்கு வழங்குவது;",
            "திருடப்பட்ட குதிரையை, அல்லது சட்டப்படி விற்பனை, போக்குவரத்து அல்லது பயன்பாடு தடைசெய்யப்பட்ட குதிரையை விற்பனைக்கு வழங்குவது;",
            "விலங்குகள் வதை, சட்டவிரோதப் பந்தயம் அல்லது சூதாட்டம், விலங்குகளுக்குத் தடைசெய்யப்பட்ட பொருட்களைப் பயன்படுத்துதல் ஆகியவற்றை ஊக்குவிப்பது;",
            "உங்களுடையதல்லாத அல்லது விற்பனைக்கு வழங்கப்படும் குதிரையுடையதல்லாத புகைப்படங்களையோ வீடியோக்களையோ பயன்படுத்துவது, அல்லது எவருடைய பதிப்புரிமை, வர்த்தகமுத்திரை அல்லது பிற உரிமைகளையும் மீறுவது;",
            "ஆபாசமான, அவதூறான, இழிவான, வெறுப்பைத் தூண்டும், அச்சுறுத்தும் அல்லது குழந்தைகளுக்குத் தீங்கு விளைவிக்கும் உள்ளடக்கம்;",
            "வேறொருவர் போல ஆள்மாறாட்டம் செய்வது, அல்லது உங்கள் அடையாளத்தையோ ஒருவருடனான உங்கள் தொடர்பையோ தவறாகச் சித்தரிப்பது;",
            "வேறொருவரின் தனிப்பட்ட விவரங்களை அவருடைய அனுமதியின்றி வெளிப்படுத்துவது;",
            "வைரஸ்கள் அல்லது தீங்கிழைக்கும் நிரல்களைக் கொண்டிருப்பது; இணையதளத்தை ஹேக் செய்ய, அதிகச் சுமையேற்ற அல்லது சீர்குலைக்க முயல்வது; உங்களுக்கு அனுமதியில்லாத தரவை அணுக முயல்வது;",
            "பதிவுகளை இட அல்லது இணையதளத்திலிருந்து தகவல்களைச் சேகரிக்க, பாட்கள் (bots), ஸ்கிரிப்டுகள் அல்லது பிற தானியங்கி வழிகளைப் பயன்படுத்துவது;",
            "இந்தியாவின் ஒற்றுமை, ஒருமைப்பாடு, பாதுகாப்பு, இறையாண்மை, வெளிநாடுகளுடனான நட்புறவு அல்லது பொது ஒழுங்கிற்கு அச்சுறுத்தலாக இருப்பது; அல்லது",
            "இந்தியாவில் தற்போது நடைமுறையில் உள்ள எந்தச் சட்டத்தையும் வேறு எவ்வகையிலேனும் மீறுவது.",
          ],
        },
      ],
    },
    {
      id: "content",
      title: "8. உங்கள் உள்ளடக்கம்",
      blocks: [
        {
          clauses: [
            { n: "8.1", text: "நீங்கள் இடும் உள்ளடக்கத்தின் உரிமை உங்களிடமே இருக்கும்." },
            {
              n: "8.2",
              text: "உள்ளடக்கத்தை இடுவதன் மூலம், அது இணையதளத்தில் இருக்கும் வரை, அதை இணையதளத்தில் ஹோஸ்ட் செய்ய, சேமிக்க, நகலெடுக்க, அளவு மாற்ற, காட்சிப்படுத்த, பகிர, இணையதளத்தை விளம்பரப்படுத்தப் பயன்படுத்த, EquineTrade-க்குப் பிரத்யேகமற்ற, ராயல்டி இல்லாத, உலகளாவிய உரிமத்தை நீங்கள் வழங்குகிறீர்கள்.",
            },
            {
              n: "8.3",
              text: "உங்கள் உள்ளடக்கத்திற்கு நீங்களே பொறுப்பு. புகைப்படங்களையும் வீடியோக்களையும் நாங்கள் அளவு மாற்றலாம் அல்லது சுருக்கலாம்; எந்த உள்ளடக்கத்தையும் எங்கள் விருப்பப்படி, முன்னறிவிப்பின்றி ஏற்க மறுக்கலாம் அல்லது நீக்கலாம்.",
            },
          ],
        },
      ],
    },
    {
      id: "reporting",
      title: "9. புகாரளித்தலும் குறைதீர்ப்பும்",
      blocks: [
        {
          clauses: [
            {
              n: "9.1",
              text: "எந்தப் பயனரும், ஒரு பதிவின் பக்கத்தில் உள்ள “இந்த விளம்பரத்தைப் புகார் செய்” இணைப்பைப் பயன்படுத்தி அதைப் பற்றிப் புகாரளிக்கலாம். ஒவ்வொரு புகாரையும் நாங்கள் பரிசீலித்து, இந்த விதிமுறைகளை மீறும் பதிவுகளை நீக்குகிறோம்.",
            },
            {
              n: "9.2",
              text: "எந்த உள்ளடக்கம் பற்றிய புகார்களையும் — அது உங்கள் உரிமைகளை மீறுகிறது என்ற புகார்கள் உட்பட — எங்கள் குறைதீர்ப்பு அலுவலருக்கு (பிரிவு 16) அனுப்பலாம். புகாரைப் பெற்ற 24 மணி நேரத்திற்குள் ஒப்புகை அளித்து, 15 நாட்களுக்குள் அதைத் தீர்க்க முயல்வோம். சட்டம் இதைவிட விரைவான நடவடிக்கையைக் கோரும் இடங்களில், அது கோரும் காலத்திற்குள் நடவடிக்கை எடுப்போம்.",
            },
            {
              n: "9.3",
              text: "நீதிமன்ற உத்தரவையோ, உரிய அரசு அல்லது அதன் முகமையிடமிருந்து சட்டப்பூர்வ அறிவிப்பையோ பெறும்போது, சட்டம் கோரும் காலத்திற்குள் அந்த உள்ளடக்கத்தை நீக்குவோம் அல்லது அதற்கான அணுகலை முடக்குவோம்.",
            },
          ],
        },
      ],
    },
    {
      id: "termination",
      title: "10. இடைநிறுத்தமும் கணக்கு முடிவும்",
      blocks: [
        {
          clauses: [
            {
              n: "10.1",
              text: "ஒரு பயனர் இந்த விதிமுறைகளையோ சட்டத்தையோ மீறியுள்ளார் என நாங்கள் நியாயமாகக் கருதினால், அல்லது பிற பயனர்களையோ EquineTrade-ஐயோ பாதுகாக்க அவசியமானால், எங்கள் விருப்பப்படி, முன்னறிவிப்பின்றி, எந்தப் பதிவையும் நீக்கலாம்; எந்தக் கணக்கையும் இடைநிறுத்தலாம் அல்லது நிரந்தரமாக மூடலாம்.",
            },
            {
              n: "10.2",
              text: "நீங்கள் எப்போது வேண்டுமானாலும் இணையதளத்தைப் பயன்படுத்துவதை நிறுத்தலாம்; உங்கள் பதிவுகளையோ முழுக் கணக்கையோ “என் சுயவிவரம்” பக்கத்திலிருந்து நீங்களே நீக்கலாம்.",
            },
            {
              n: "10.3",
              text: "உங்கள் கணக்கு மூடப்பட்ட பிறகும் பிரிவுகள் 8, 11, 12, 13, 15 தொடர்ந்து பொருந்தும்.",
            },
          ],
        },
      ],
    },
    {
      id: "disclaimers",
      title: "11. பொறுப்புத் துறப்புகள்",
      blocks: [
        {
          clauses: [
            {
              n: "11.1",
              text: "இணையதளம் “உள்ளது உள்ளபடி”, “கிடைக்கும் நிலையில்” என்ற அடிப்படையில் வழங்கப்படுகிறது. அது எப்போதும் கிடைக்கும், தடையின்றி இயங்கும், பிழையின்றி இருக்கும், பாதுகாப்பாக இருக்கும் என நாங்கள் உறுதியளிப்பதில்லை.",
            },
            {
              n: "11.2",
              text: "சட்டம் அனுமதிக்கும் அளவிற்கு, இணையதளம், எந்தப் பதிவு அல்லது எந்தக் குதிரை குறித்தும், வெளிப்படையாகவோ மறைமுகமாகவோ எந்த உத்தரவாதமும் நாங்கள் அளிப்பதில்லை.",
            },
            {
              n: "11.3",
              text: "இன விளக்கங்கள், பாதுகாப்புக் குறிப்புகள் போன்ற இணையதளத்தில் உள்ள தகவல்கள் பொதுவானவை; அவை கால்நடை மருத்துவ, சட்ட அல்லது நிதி ஆலோசனை அல்ல.",
            },
          ],
        },
      ],
    },
    {
      id: "liability",
      title: "12. பொறுப்பு வரம்பு",
      blocks: [
        {
          clauses: [
            {
              n: "12.1",
              text: "சட்டம் அனுமதிக்கும் முழு அளவிற்கு, பின்வருவனவற்றால் அல்லது அவை தொடர்பாக ஏற்படும் எந்த இழப்பு அல்லது சேதத்திற்கும் EquineTrade, அதன் நிறுவனர்கள், குழு உறுப்பினர்கள், சேவை வழங்குநர்கள் பொறுப்பாக மாட்டார்கள்:",
              items: [
                "பயனர்களுக்கு இடையிலான எந்தப் பரிமாற்றம் அல்லது பரிவர்த்தனையும் — பணம் செலுத்துதல், ஒப்படைப்பு, அல்லது எந்தக் குதிரையின் நிலை, உடல்நலம், காயம், இறப்பு அல்லது நடத்தை உட்பட;",
                "பயனர்கள் இடும் எந்த உள்ளடக்கமும்;",
                "தரவு, லாபம், வணிகம் அல்லது நற்பெயர் இழப்பு, அல்லது மறைமுகமான அல்லது விளைவாக ஏற்படும் எந்த இழப்பும்; அல்லது",
                "இணையதளம் கிடைக்காமல் போவது, அல்லது ஏதேனும் பிழை, வைரஸ் அல்லது பாதுகாப்பு மீறல்.",
              ],
            },
            {
              n: "12.2",
              text: "இவற்றையும் மீறி EquineTrade உங்களுக்குப் பொறுப்பு எனக் கண்டறியப்பட்டால், எங்கள் மொத்தப் பொறுப்பு ₹1,000 (ஆயிரம் இந்திய ரூபாய்) அல்லது கோரிக்கைக்கு முந்தைய பன்னிரண்டு மாதங்களில் நீங்கள் எங்களுக்குச் செலுத்திய மொத்தத் தொகை — இவற்றில் எது அதிகமோ அதைத் தாண்டாது.",
            },
            {
              n: "12.3",
              text: "பொருந்தக்கூடிய சட்டத்தின் கீழ் வரம்பிட முடியாத எந்தப் பொறுப்பையும் இந்த விதிமுறைகளில் உள்ள எதுவும் வரம்பிடாது.",
            },
          ],
        },
      ],
    },
    {
      id: "indemnity",
      title: "13. இழப்பீடு",
      blocks: [
        {
          p: "உங்கள் உள்ளடக்கம், நீங்கள் இணையதளத்தைப் பயன்படுத்துவது, பிற பயனர்களுடனான உங்கள் பரிமாற்றங்கள், அல்லது இந்த விதிமுறைகளை அல்லது எந்தச் சட்டத்தையும் நீங்கள் மீறுவது ஆகியவற்றால் எழும் எந்தக் கோரிக்கை, இழப்பு, சேதம் அல்லது செலவுக்கும் (நியாயமான சட்டக் கட்டணங்கள் உட்பட) எதிராக EquineTrade, அதன் நிறுவனர்கள், குழு உறுப்பினர்கள், சேவை வழங்குநர்கள் ஆகியோருக்கு இழப்பீடு அளிக்கவும், அவர்களுக்குத் தீங்கு நேராமல் பாதுகாக்கவும் நீங்கள் ஒப்புக்கொள்கிறீர்கள்.",
        },
      ],
    },
    {
      id: "changes",
      title: "14. இணையதளத்திலும் இந்த விதிமுறைகளிலும் மாற்றங்கள்",
      blocks: [
        {
          clauses: [
            {
              n: "14.1",
              text: "இணையதளத்தின் எந்தப் பகுதியையும் எப்போது வேண்டுமானாலும் மாற்றலாம், இடைநிறுத்தலாம் அல்லது நிறுத்திவிடலாம்.",
            },
            {
              n: "14.2",
              text: "இந்த விதிமுறைகளை அவ்வப்போது புதுப்பிக்கக்கூடும். அப்போது மேலே உள்ள “கடைசியாகப் புதுப்பிக்கப்பட்டது” தேதியை மாற்றுவோம்; முக்கியமான மாற்றங்கள் குறித்து இணையதளத்தில் அறிவிப்பும் வெளியிடுவோம். மாற்றத்திற்குப் பிறகும் நீங்கள் இணையதளத்தைத் தொடர்ந்து பயன்படுத்தினால், புதுப்பிக்கப்பட்ட விதிமுறைகளை ஏற்றுக்கொள்கிறீர்கள்.",
            },
          ],
        },
      ],
    },
    {
      id: "governing-law",
      title: "15. நிர்வகிக்கும் சட்டமும் சர்ச்சைகளும்",
      blocks: [
        {
          clauses: [
            { n: "15.1", text: "இந்த விதிமுறைகள் இந்தியச் சட்டங்களால் நிர்வகிக்கப்படுகின்றன." },
            {
              n: "15.2",
              text: "எங்களுடன் உங்களுக்கு ஏதேனும் சர்ச்சை இருந்தால், அதைச் சுமுகமாகத் தீர்க்க முயல, முதலில் எங்கள் குறைதீர்ப்பு அலுவலரைத் தொடர்புகொள்ளுங்கள்.",
            },
            {
              n: "15.3",
              text: `மேற்கூறியவற்றுக்கு உட்பட்டு, இந்த விதிமுறைகள் அல்லது இணையதளத்தால் அல்லது அவை தொடர்பாக எழும் எந்தச் சர்ச்சையையும் விசாரிக்கும் பிரத்யேக அதிகார வரம்பு, தமிழ்நாட்டின் ${G.city}-இல் உள்ள நீதிமன்றங்களுக்கே உண்டு.`,
            },
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "16. குறைதீர்ப்பு அலுவலரும் தொடர்பும்",
      blocks: [
        {
          p: "இந்த விதிமுறைகள், ஒரு பதிவு அல்லது வேறு எந்த உள்ளடக்கம் குறித்த எந்தக் கேள்வி அல்லது புகாருக்கும், எங்கள் குறைதீர்ப்பு அலுவலரைத் தொடர்புகொள்ளுங்கள்:",
        },
        {
          list: [
            { label: "பெயர்:", text: G.name },
            { label: "மின்னஞ்சல்:", text: G.email },
            { label: "முகவரி:", text: `${G.city}, தமிழ்நாடு, இந்தியா` },
          ],
        },
      ],
    },
    {
      id: "general",
      title: "17. பொது",
      blocks: [
        {
          clauses: [
            {
              n: "17.1",
              text: "இந்த விதிமுறைகளும் எங்கள் தனியுரிமைக் கொள்கையும் சேர்ந்து, இணையதளம் தொடர்பாக உங்களுக்கும் EquineTrade-க்கும் இடையிலான முழுமையான ஒப்பந்தமாக அமைகின்றன.",
            },
            {
              n: "17.2",
              text: "இந்த விதிமுறைகளின் ஏதேனும் ஒரு பகுதி செல்லாதது அல்லது நடைமுறைப்படுத்த இயலாதது எனக் கண்டறியப்பட்டால், மீதமுள்ள பகுதிகள் முழுமையாக நடைமுறையில் இருக்கும்.",
            },
            {
              n: "17.3",
              text: "இந்த விதிமுறைகளின் கீழ் உள்ள ஏதேனும் ஓர் உரிமையை நாங்கள் செயல்படுத்தவில்லை என்றால், அந்த உரிமையை நாங்கள் கைவிட்டுவிட்டோம் என்று பொருளாகாது.",
            },
            {
              n: "17.4",
              text: "இந்த விதிமுறைகளின் கீழ் உள்ள உங்கள் உரிமைகளையோ கடமைகளையோ நீங்கள் வேறொருவருக்கு மாற்றக் கூடாது. இணையதளத்தைப் பொறுப்பேற்கும் எந்த நிறுவனத்திற்கும் எங்களுடையவற்றை நாங்கள் மாற்றலாம்.",
            },
            {
              n: "17.5",
              text: "இந்த விதிமுறைகள் ஆங்கிலத்திலும் தமிழிலும் வழங்கப்படுகின்றன. இரண்டு பதிப்புகளுக்கும் இடையே பொருள் வேறுபாடு இருந்தால், ஆங்கிலப் பதிப்பே செல்லுபடியாகும்.",
            },
          ],
        },
      ],
    },
  ],
};

export const termsOfUse = { en, ta };
