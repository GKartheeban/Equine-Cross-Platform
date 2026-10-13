// EquineTrade Privacy Policy, in English and Tamil.
// Shown at /privacy. To change the wording, edit the text below.
// Before launch: fill in the Grievance Officer details in src/content/legal.ts.

import { SITE_URL } from "@/lib/site";
import { GRIEVANCE_OFFICER, type LegalDocument } from "@/content/legal";

/** Change this date whenever the policy text changes. */
export const LAST_UPDATED = "2026-10-13";

const SITE = new URL(SITE_URL).host;
const G = GRIEVANCE_OFFICER;

const en: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "Last updated",
  contentsTitle: "Contents",
  intro: [
    {
      p: `EquineTrade (“EquineTrade”, “we”, “us” or “our”) runs the website ${SITE}, an online marketplace where people in Tamil Nadu can list horses for sale and contact sellers directly. This Privacy Policy explains what personal data we collect, why we collect it, who can see it, how long we keep it, and the choices and rights you have.`,
    },
    {
      p: "This policy applies to everyone who visits or uses the website, whether or not they have an account. By creating an account or using the website, you agree to your information being collected and used as described here. If you do not agree, please do not use the website.",
    },
    {
      p: "This policy is available in English and Tamil. You can switch between them using the EN / தமிழ் button at the top of the page.",
    },
  ],
  sections: [
    {
      id: "information-we-collect",
      title: "1. Information we collect",
      blocks: [
        { h3: "1.1 Information you give us" },
        {
          list: [
            {
              label: "Account details:",
              text: "your mobile number, the name you choose to show, and your password. Your password is stored only in a scrambled (hashed) form, so no one at EquineTrade can see it.",
            },
            { label: "Profile details (optional):", text: "your profile photo, district and preferred language." },
            {
              label: "Listing details:",
              text: "information about a horse you sell, such as breed, gender, age, height, colour, health and training details, price, district and town, description, and the photos and videos you upload.",
            },
            { label: "Vet certificate (optional):", text: "if you upload one, it is kept in private storage." },
            { label: "Reports:", text: "if you report a listing, the reason you choose and any details you write." },
            { label: "Saved horses:", text: "the listings you save to look at later." },
          ],
        },
        { h3: "1.2 Information collected automatically" },
        {
          list: [
            {
              label: "Usage activity:",
              text: "when horse pages are viewed, when the Call or WhatsApp buttons are tapped, when listings are saved, and which search filters are used. This is recorded with a random code for your device, the type of device (mobile or desktop) and the language you use. If you are logged in, it is also linked to your account.",
            },
            {
              label: "Technical information:",
              text: "like any website, our hosting providers automatically receive information such as your IP address, browser type and the pages you open. This is needed to deliver the website and keep it secure.",
            },
            {
              label: "Security records:",
              text: "attempts to recover an account with a recovery code, including the mobile number entered and whether the attempt succeeded, so that we can stop misuse.",
            },
          ],
        },
        { h3: "1.3 Information from Google" },
        {
          p: "If you choose to link your Google account, Google shares your name, email address and profile picture with us. We use this only to let you log in with Google. We never receive your Google password, and we have no access to your Gmail, contacts or any other Google data.",
        },
      ],
    },
    {
      id: "how-we-use",
      title: "2. How we use your information",
      blocks: [
        {
          list: [
            "To create and manage your account and let you log in.",
            "To publish your listings and show them to buyers.",
            "To let interested buyers contact you by phone call or WhatsApp.",
            "To help you get back into your account (with a recovery code, Google login, or a password reset by our team).",
            "To keep the marketplace safe: to review reported listings, remove fake, misleading or illegal listings, prevent fraud and spam, and enforce our Terms of Use.",
            "To understand how the website is used, for example which pages are popular, so that we can improve it.",
            "To contact you about your account, your listings or a complaint you have made.",
            "To comply with the law and respond to lawful requests from authorities.",
          ],
        },
        { p: "We do not sell your personal data, and we do not use it for third-party advertising." },
      ],
    },
    {
      id: "what-others-see",
      title: "3. What other people can see",
      blocks: [
        {
          list: [
            {
              label: "Everyone:",
              text: "your listings (photos, videos, horse details, district, town and price), your display name, your profile photo, the date you joined, and a note if you changed your name in the last 30 days.",
            },
            {
              label: "Only logged-in users:",
              text: "your mobile number, shown on your live listings so that buyers can call or WhatsApp you. It is no longer shown once the listing is marked as sold or is removed.",
            },
            {
              label: "No one else:",
              text: "your password, recovery code, vet certificate (buyers only see that a certificate was uploaded), the reports you make, your saved horses and your usage activity.",
            },
          ],
        },
        {
          p: "Anything you write in a listing or show in its photos and videos is public. Please do not include personal details there that you do not want others to see.",
        },
      ],
    },
    {
      id: "sharing",
      title: "4. When we share information",
      blocks: [
        { p: "We share personal data only in the following cases:" },
        {
          list: [
            {
              label: "Service providers:",
              text: "companies that run parts of the website for us: Supabase (database, login and file storage), Netlify (website hosting) and Google (only if you use Google login). We may also use Cloudflare to store photos and videos. They handle the data only to provide their services to us, under their own security and privacy commitments.",
            },
            {
              label: "Buyers and sellers:",
              text: "as described in section 3. Calls and WhatsApp chats between buyers and sellers happen outside our website, and the phone company's or WhatsApp's own terms and privacy policy apply to them.",
            },
            {
              label: "Legal reasons:",
              text: "when required by law, a court order, or a lawful request from a government agency or the police, or when needed to protect the rights, safety or property of our users, the public or EquineTrade.",
            },
            {
              label: "Change of ownership:",
              text: "if EquineTrade is merged with, sold to or transferred to another organisation, your data may move to the new owner, who must continue to protect it as this policy describes.",
            },
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "5. Cookies and storage on your device",
      blocks: [
        { p: "We do not use advertising cookies or third-party tracking. The website stores only these small items on your device:" },
        {
          list: [
            "A language cookie that remembers whether you chose English or Tamil.",
            "Login details that keep you signed in.",
            "A random device code, used for the usage activity described in section 1.2.",
            "A short note that a horse page was already counted as viewed during your visit, so it is not counted twice.",
          ],
        },
        {
          p: "You can clear these at any time in your browser settings. If you do, you will be logged out and the website will return to English.",
        },
      ],
    },
    {
      id: "where-stored",
      title: "6. Where your data is stored",
      blocks: [
        {
          p: "Our service providers keep data on secure servers that may be located outside India. Where data is transferred outside India, we do so in line with Indian law, and we use only providers that protect data with industry-standard security.",
        },
      ],
    },
    {
      id: "retention",
      title: "7. How long we keep your data",
      blocks: [
        {
          list: [
            { label: "Account details:", text: "for as long as your account is open." },
            {
              label: "Listings:",
              text: "until you delete them. When you delete a listing, its photos, videos and vet certificate are deleted too. Listings marked as sold stay in your account until you delete them.",
            },
            {
              label: "Listings removed by our team:",
              text: "may be kept for a limited time as a record, for safety and legal reasons.",
            },
            {
              label: "Usage activity:",
              text: "kept to understand how the website is used. When an account is deleted, its activity is no longer linked to it.",
            },
            {
              label: "Reports, moderation and security records:",
              text: "kept only as long as needed for safety, fraud prevention and legal purposes.",
            },
          ],
        },
        {
          p: "You can delete your account yourself at any time from My profile. Your account, listings, photos, videos and personal details are then deleted straight away. We keep only a short record of the deletion: its date and your mobile number in a masked form (for example, +91 98XXXXXX10) together with a scrambled (hashed) copy that helps us prevent repeated misuse. If you ask us to delete your account instead, we will do so within 30 days. In both cases, we keep only information that we must retain by law or to resolve a dispute.",
        },
      ],
    },
    {
      id: "security",
      title: "8. How we protect your data",
      blocks: [
        {
          list: [
            "Every page is served over an encrypted (HTTPS) connection.",
            "Passwords and recovery codes are stored only in scrambled (hashed) form.",
            "Database rules allow each user to change only their own data, and vet certificates are kept in private storage.",
            "Limits on recovery attempts and on new listings per day help prevent misuse.",
            "Only a small number of authorised team members can use the admin tools, and their actions are recorded.",
          ],
        },
        {
          p: "No website can be completely secure. Keep your password and recovery code to yourself. EquineTrade will never ask for them by phone, SMS or WhatsApp. If a data breach affects you, we will inform you and the authorities as the law requires.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "9. Your rights and choices",
      blocks: [
        { p: "Under Indian law, including the Digital Personal Data Protection Act, 2023, you have the right to:" },
        {
          list: [
            { label: "Access:", text: "ask for a summary of the personal data we hold about you and how we use it." },
            {
              label: "Correction:",
              text: "update your name, photo, district and listings yourself on your profile and listing pages, or ask us to correct anything else.",
            },
            { label: "Deletion:", text: "delete your listings, or your whole account, yourself at any time from My profile, or ask us to do it for you." },
            {
              label: "Withdraw consent:",
              text: "stop using the website and delete your account at any time. This does not affect anything done before you withdrew consent.",
            },
            { label: "Complain:", text: "raise a grievance with our Grievance Officer (see section 13)." },
            {
              label: "Nominate:",
              text: "name another person to use these rights on your behalf in the event of your death or incapacity.",
            },
          ],
        },
        {
          p: "To use any of these rights, contact us from the mobile number linked to your account, or include that number in your email, so that we can confirm the request is really from you.",
        },
      ],
    },
    {
      id: "age",
      title: "10. Age limit",
      blocks: [
        {
          p: "EquineTrade is only for people aged 18 and above. We do not knowingly collect personal data from anyone under 18. If you believe someone under 18 has created an account, please contact us and we will delete it.",
        },
      ],
    },
    {
      id: "other-services",
      title: "11. Other websites and apps",
      blocks: [
        {
          p: "The website links to services run by others, such as WhatsApp, your phone's calling app and Google. We are not responsible for how they handle your data. Please read their privacy policies.",
        },
      ],
    },
    {
      id: "changes",
      title: "12. Changes to this policy",
      blocks: [
        {
          p: "We may update this policy when the website or the law changes. We will change the “Last updated” date at the top, and we will show a notice on the website for important changes. If you keep using the website after a change, you accept the updated policy.",
        },
      ],
    },
    {
      id: "contact",
      title: "13. Grievance Officer and contact",
      blocks: [
        { p: "For any question, request or complaint about your personal data, please contact our Grievance Officer:" },
        {
          list: [
            { label: "Name:", text: G.name },
            { label: "Email:", text: G.email },
            { label: "Address:", text: `${G.city}, Tamil Nadu, India` },
          ],
        },
        {
          p: "We will acknowledge your complaint within 24 hours and aim to resolve it within 15 days of receiving it. If you are not satisfied with our response, you may complain to the Data Protection Board of India.",
        },
      ],
    },
    {
      id: "language",
      title: "14. Language",
      blocks: [
        {
          p: "This policy is provided in English and Tamil. If the two versions differ in meaning, the English version will apply.",
        },
      ],
    },
  ],
};

const ta: LegalDocument = {
  title: "தனியுரிமைக் கொள்கை",
  lastUpdated: "கடைசியாகப் புதுப்பிக்கப்பட்டது",
  contentsTitle: "பொருளடக்கம்",
  intro: [
    {
      p: `EquineTrade (“EquineTrade”, “நாங்கள்”, “எங்கள்”) நடத்தும் ${SITE} இணையதளம், தமிழ்நாட்டில் உள்ளவர்கள் விற்பனைக்கான குதிரைகளைப் பதிவிடவும், விற்பனையாளர்களை நேரடியாகத் தொடர்புகொள்ளவும் உதவும் ஓர் இணையச் சந்தை. நாங்கள் என்னென்ன தனிப்பட்ட தரவுகளைச் சேகரிக்கிறோம், ஏன் சேகரிக்கிறோம், அவற்றை யார் பார்க்க முடியும், எவ்வளவு காலம் வைத்திருக்கிறோம், உங்களுக்குள்ள தேர்வுகளும் உரிமைகளும் என்ன என்பதை இந்தத் தனியுரிமைக் கொள்கை விளக்குகிறது.`,
    },
    {
      p: "கணக்கு வைத்திருப்பவர், இல்லாதவர் என்ற வேறுபாடின்றி, இந்த இணையதளத்தைப் பார்வையிடும் அல்லது பயன்படுத்தும் அனைவருக்கும் இந்தக் கொள்கை பொருந்தும். கணக்கை உருவாக்குவதன் மூலமோ இணையதளத்தைப் பயன்படுத்துவதன் மூலமோ, இங்கு விவரிக்கப்பட்டுள்ளபடி உங்கள் தகவல்கள் சேகரிக்கப்பட்டுப் பயன்படுத்தப்படுவதற்கு நீங்கள் ஒப்புக்கொள்கிறீர்கள். நீங்கள் ஒப்புக்கொள்ளவில்லை எனில், தயவுசெய்து இணையதளத்தைப் பயன்படுத்த வேண்டாம்.",
    },
    {
      p: "இந்தக் கொள்கை ஆங்கிலத்திலும் தமிழிலும் கிடைக்கிறது. பக்கத்தின் மேலே உள்ள EN / தமிழ் பொத்தானைப் பயன்படுத்தி மொழியை மாற்றலாம்.",
    },
  ],
  sections: [
    {
      id: "information-we-collect",
      title: "1. நாங்கள் சேகரிக்கும் தகவல்கள்",
      blocks: [
        { h3: "1.1 நீங்கள் எங்களுக்கு வழங்கும் தகவல்கள்" },
        {
          list: [
            {
              label: "கணக்கு விவரங்கள்:",
              text: "உங்கள் மொபைல் எண், நீங்கள் காட்ட விரும்பும் பெயர், உங்கள் கடவுச்சொல். கடவுச்சொல் மாற்றியமைக்கப்பட்ட (hash செய்யப்பட்ட) வடிவில் மட்டுமே சேமிக்கப்படுவதால், EquineTrade-இல் யாராலும் அதைப் பார்க்க முடியாது.",
            },
            { label: "சுயவிவர விவரங்கள் (விருப்பம்):", text: "உங்கள் சுயவிவரப் புகைப்படம், மாவட்டம், விருப்ப மொழி." },
            {
              label: "பதிவு விவரங்கள்:",
              text: "நீங்கள் விற்கும் குதிரை பற்றிய தகவல்கள் — இனம், பாலினம், வயது, உயரம், நிறம், உடல்நலம் மற்றும் பயிற்சி விவரங்கள், விலை, மாவட்டம், ஊர், விளக்கம், நீங்கள் பதிவேற்றும் புகைப்படங்கள் மற்றும் வீடியோக்கள்.",
            },
            {
              label: "கால்நடை மருத்துவச் சான்றிதழ் (விருப்பம்):",
              text: "நீங்கள் பதிவேற்றினால், அது தனிப்பட்ட (பொதுவில் தெரியாத) சேமிப்பகத்தில் வைக்கப்படும்.",
            },
            { label: "புகார்கள்:", text: "ஒரு பதிவைப் பற்றி நீங்கள் புகாரளித்தால், நீங்கள் தேர்ந்தெடுக்கும் காரணமும் நீங்கள் எழுதும் விவரங்களும்." },
            { label: "சேமித்த குதிரைகள்:", text: "பின்னர் பார்ப்பதற்காக நீங்கள் சேமிக்கும் பதிவுகள்." },
          ],
        },
        { h3: "1.2 தானாகச் சேகரிக்கப்படும் தகவல்கள்" },
        {
          list: [
            {
              label: "பயன்பாட்டுச் செயல்பாடுகள்:",
              text: "குதிரைப் பக்கங்கள் பார்க்கப்படுவது, அழைப்பு அல்லது WhatsApp பொத்தான்கள் அழுத்தப்படுவது, பதிவுகள் சேமிக்கப்படுவது, எந்தத் தேடல் வடிகட்டிகள் பயன்படுத்தப்படுகின்றன என்பவை. இவை உங்கள் சாதனத்திற்கான ஒரு சீரற்ற குறியீடு, சாதன வகை (மொபைல் அல்லது கணினி), நீங்கள் பயன்படுத்தும் மொழி ஆகியவற்றுடன் பதிவு செய்யப்படுகின்றன. நீங்கள் உள்நுழைந்திருந்தால், இவை உங்கள் கணக்குடனும் இணைக்கப்படும்.",
            },
            {
              label: "தொழில்நுட்பத் தகவல்கள்:",
              text: "எல்லா இணையதளங்களையும் போலவே, உங்கள் IP முகவரி, உலாவி வகை, நீங்கள் திறக்கும் பக்கங்கள் போன்ற தகவல்கள் எங்கள் ஹோஸ்டிங் சேவை வழங்குநர்களுக்குத் தானாகவே கிடைக்கின்றன. இணையதளத்தை வழங்கவும் பாதுகாப்பாக வைத்திருக்கவும் இவை தேவைப்படுகின்றன.",
            },
            {
              label: "பாதுகாப்புப் பதிவுகள்:",
              text: "மீட்புக் குறியீட்டைப் பயன்படுத்திக் கணக்கை மீட்க மேற்கொள்ளப்படும் முயற்சிகள் — உள்ளிடப்பட்ட மொபைல் எண், முயற்சி வெற்றிபெற்றதா என்பது உட்பட. தவறான பயன்பாட்டைத் தடுக்க இவை உதவுகின்றன.",
            },
          ],
        },
        { h3: "1.3 Google-இடமிருந்து பெறப்படும் தகவல்கள்" },
        {
          p: "உங்கள் Google கணக்கை இணைக்க நீங்கள் தேர்வுசெய்தால், உங்கள் பெயர், மின்னஞ்சல் முகவரி, சுயவிவரப் படம் ஆகியவற்றை Google எங்களுடன் பகிர்கிறது. Google மூலம் நீங்கள் உள்நுழைவதற்கு மட்டுமே இவற்றைப் பயன்படுத்துகிறோம். உங்கள் Google கடவுச்சொல் எங்களுக்கு ஒருபோதும் கிடைக்காது; உங்கள் Gmail, தொடர்புகள் அல்லது வேறு எந்த Google தரவையும் எங்களால் அணுக முடியாது.",
        },
      ],
    },
    {
      id: "how-we-use",
      title: "2. உங்கள் தகவல்களை எவ்வாறு பயன்படுத்துகிறோம்",
      blocks: [
        {
          list: [
            "உங்கள் கணக்கை உருவாக்கி நிர்வகிக்கவும், நீங்கள் உள்நுழையவும்.",
            "உங்கள் பதிவுகளை வெளியிட்டு வாங்குபவர்களுக்குக் காட்ட.",
            "ஆர்வமுள்ள வாங்குபவர்கள் உங்களைத் தொலைபேசி அழைப்பு அல்லது WhatsApp மூலம் தொடர்புகொள்ள.",
            "உங்கள் கணக்கிற்குள் மீண்டும் நுழைய உதவ (மீட்புக் குறியீடு, Google உள்நுழைவு, அல்லது எங்கள் குழுவின் கடவுச்சொல் மாற்றம் மூலம்).",
            "சந்தையைப் பாதுகாப்பாக வைத்திருக்க: புகாரளிக்கப்பட்ட பதிவுகளைப் பரிசீலிக்க, போலியான, தவறாக வழிநடத்தும் அல்லது சட்டவிரோதமான பதிவுகளை நீக்க, மோசடி மற்றும் தேவையற்ற செய்திகளைத் தடுக்க, எங்கள் பயன்பாட்டு விதிமுறைகளைச் செயல்படுத்த.",
            "இணையதளம் எவ்வாறு பயன்படுத்தப்படுகிறது என்பதைப் புரிந்துகொண்டு (உதாரணமாக, எந்தப் பக்கங்கள் அதிகம் பார்க்கப்படுகின்றன) அதை மேம்படுத்த.",
            "உங்கள் கணக்கு, பதிவுகள் அல்லது நீங்கள் அளித்த புகார் தொடர்பாக உங்களைத் தொடர்புகொள்ள.",
            "சட்டத்திற்கு இணங்கவும், அதிகாரிகளின் சட்டப்பூர்வக் கோரிக்கைகளுக்குப் பதிலளிக்கவும்.",
          ],
        },
        { p: "உங்கள் தனிப்பட்ட தரவை நாங்கள் விற்பதில்லை; மூன்றாம் தரப்பு விளம்பரங்களுக்கும் அதைப் பயன்படுத்துவதில்லை." },
      ],
    },
    {
      id: "what-others-see",
      title: "3. மற்றவர்கள் எதைப் பார்க்க முடியும்",
      blocks: [
        {
          list: [
            {
              label: "அனைவரும்:",
              text: "உங்கள் பதிவுகள் (புகைப்படங்கள், வீடியோக்கள், குதிரை விவரங்கள், மாவட்டம், ஊர், விலை), நீங்கள் காட்டும் பெயர், சுயவிவரப் புகைப்படம், நீங்கள் இணைந்த தேதி, கடந்த 30 நாட்களில் பெயரை மாற்றியிருந்தால் அது பற்றிய குறிப்பு.",
            },
            {
              label: "உள்நுழைந்த பயனர்கள் மட்டும்:",
              text: "வாங்குபவர்கள் உங்களை அழைக்க அல்லது WhatsApp செய்ய, உங்கள் நேரலைப் பதிவுகளில் உங்கள் மொபைல் எண் காட்டப்படும். பதிவு விற்கப்பட்டதாகக் குறிக்கப்பட்டாலோ நீக்கப்பட்டாலோ, எண் இனி காட்டப்படாது.",
            },
            {
              label: "வேறு யாரும் பார்க்க முடியாதவை:",
              text: "உங்கள் கடவுச்சொல், மீட்புக் குறியீடு, கால்நடை மருத்துவச் சான்றிதழ் (சான்றிதழ் பதிவேற்றப்பட்டுள்ளது என்பது மட்டுமே வாங்குபவர்களுக்குத் தெரியும்), நீங்கள் அளிக்கும் புகார்கள், சேமித்த குதிரைகள், உங்கள் பயன்பாட்டுச் செயல்பாடுகள்.",
            },
          ],
        },
        {
          p: "ஒரு பதிவில் நீங்கள் எழுதுவதும், அதன் புகைப்படங்கள் மற்றும் வீடியோக்களில் காட்டுவதும் அனைவருக்கும் தெரியும். மற்றவர்கள் பார்க்க நீங்கள் விரும்பாத தனிப்பட்ட விவரங்களை அங்கு சேர்க்க வேண்டாம்.",
        },
      ],
    },
    {
      id: "sharing",
      title: "4. தகவல்களை எப்போது பகிர்கிறோம்",
      blocks: [
        { p: "பின்வரும் சூழ்நிலைகளில் மட்டுமே தனிப்பட்ட தரவைப் பகிர்கிறோம்:" },
        {
          list: [
            {
              label: "சேவை வழங்குநர்கள்:",
              text: "எங்களுக்காக இணையதளத்தின் பகுதிகளை இயக்கும் நிறுவனங்கள்: Supabase (தரவுத்தளம், உள்நுழைவு, கோப்புச் சேமிப்பு), Netlify (இணையதள ஹோஸ்டிங்), Google (நீங்கள் Google உள்நுழைவைப் பயன்படுத்தினால் மட்டும்). புகைப்படங்கள் மற்றும் வீடியோக்களைச் சேமிக்க Cloudflare-ஐயும் பயன்படுத்தக்கூடும். இவை தங்களின் சொந்தப் பாதுகாப்பு மற்றும் தனியுரிமை உறுதிமொழிகளுக்கு உட்பட்டு, எங்களுக்குச் சேவை வழங்குவதற்காக மட்டுமே தரவைக் கையாள்கின்றன.",
            },
            {
              label: "வாங்குபவர்களும் விற்பனையாளர்களும்:",
              text: "பிரிவு 3-இல் விவரிக்கப்பட்டுள்ளபடி. வாங்குபவர்களுக்கும் விற்பனையாளர்களுக்கும் இடையிலான அழைப்புகளும் WhatsApp உரையாடல்களும் எங்கள் இணையதளத்திற்கு வெளியே நடைபெறுகின்றன; அவற்றுக்குத் தொலைபேசி நிறுவனத்தின் அல்லது WhatsApp-இன் சொந்த விதிமுறைகளும் தனியுரிமைக் கொள்கையும் பொருந்தும்.",
            },
            {
              label: "சட்டக் காரணங்கள்:",
              text: "சட்டம், நீதிமன்ற உத்தரவு, அல்லது அரசு நிறுவனம் அல்லது காவல்துறையின் சட்டப்பூர்வக் கோரிக்கை ஆகியவற்றின்படி தேவைப்படும்போது; அல்லது எங்கள் பயனர்கள், பொதுமக்கள் அல்லது EquineTrade-இன் உரிமைகள், பாதுகாப்பு, சொத்து ஆகியவற்றைப் பாதுகாக்கத் தேவைப்படும்போது.",
            },
            {
              label: "உரிமை மாற்றம்:",
              text: "EquineTrade வேறொரு நிறுவனத்துடன் இணைக்கப்பட்டாலோ, விற்கப்பட்டாலோ, மாற்றப்பட்டாலோ, உங்கள் தரவு புதிய உரிமையாளருக்குச் செல்லக்கூடும். இந்தக் கொள்கையில் விவரிக்கப்பட்டுள்ளபடியே அவர்களும் அதைப் பாதுகாக்க வேண்டும்.",
            },
          ],
        },
      ],
    },
    {
      id: "cookies",
      title: "5. குக்கீகளும் உங்கள் சாதனத்தில் சேமிக்கப்படுபவையும்",
      blocks: [
        {
          p: "விளம்பரக் குக்கீகளையோ மூன்றாம் தரப்புக் கண்காணிப்பையோ நாங்கள் பயன்படுத்துவதில்லை. இணையதளம் உங்கள் சாதனத்தில் பின்வரும் சிறிய தகவல்களை மட்டுமே சேமிக்கிறது:",
        },
        {
          list: [
            "நீங்கள் ஆங்கிலத்தைத் தேர்ந்தெடுத்தீர்களா தமிழைத் தேர்ந்தெடுத்தீர்களா என்பதை நினைவில் வைக்கும் மொழிக் குக்கீ.",
            "நீங்கள் உள்நுழைந்த நிலையிலேயே இருக்க உதவும் உள்நுழைவு விவரங்கள்.",
            "பிரிவு 1.2-இல் விவரிக்கப்பட்டுள்ள பயன்பாட்டுச் செயல்பாடுகளுக்காகப் பயன்படும் ஒரு சீரற்ற சாதனக் குறியீடு.",
            "ஒரு குதிரைப் பக்கம் உங்கள் வருகையின்போது ஏற்கனவே பார்க்கப்பட்டதாகக் கணக்கிடப்பட்டது என்ற சிறு குறிப்பு — இரண்டு முறை கணக்கிடப்படாமல் இருக்க.",
          ],
        },
        {
          p: "உங்கள் உலாவி அமைப்புகளில் இவற்றை எப்போது வேண்டுமானாலும் அழிக்கலாம். அப்படிச் செய்தால், நீங்கள் வெளியேற்றப்படுவீர்கள்; இணையதளம் மீண்டும் ஆங்கிலத்திற்குத் திரும்பும்.",
        },
      ],
    },
    {
      id: "where-stored",
      title: "6. உங்கள் தரவு எங்கே சேமிக்கப்படுகிறது",
      blocks: [
        {
          p: "எங்கள் சேவை வழங்குநர்கள், இந்தியாவுக்கு வெளியே அமைந்திருக்கக்கூடிய பாதுகாப்பான சர்வர்களில் தரவைச் சேமிக்கின்றனர். தரவு இந்தியாவுக்கு வெளியே மாற்றப்படும்போது, இந்தியச் சட்டத்திற்கு இணங்கவே அவ்வாறு செய்கிறோம்; தொழில்துறைத் தரத்திலான பாதுகாப்புடன் தரவைப் பாதுகாக்கும் வழங்குநர்களை மட்டுமே பயன்படுத்துகிறோம்.",
        },
      ],
    },
    {
      id: "retention",
      title: "7. உங்கள் தரவை எவ்வளவு காலம் வைத்திருக்கிறோம்",
      blocks: [
        {
          list: [
            { label: "கணக்கு விவரங்கள்:", text: "உங்கள் கணக்கு செயலில் இருக்கும் வரை." },
            {
              label: "பதிவுகள்:",
              text: "நீங்கள் நீக்கும் வரை. ஒரு பதிவை நீக்கும்போது, அதன் புகைப்படங்கள், வீடியோக்கள், கால்நடை மருத்துவச் சான்றிதழ் ஆகியவையும் நீக்கப்படும். விற்கப்பட்டதாகக் குறிக்கப்பட்ட பதிவுகள், நீங்கள் நீக்கும் வரை உங்கள் கணக்கில் இருக்கும்.",
            },
            {
              label: "எங்கள் குழுவால் நீக்கப்பட்ட பதிவுகள்:",
              text: "பாதுகாப்பு மற்றும் சட்டக் காரணங்களுக்காக, ஒரு பதிவாகக் குறிப்பிட்ட காலம் வைத்திருக்கப்படலாம்.",
            },
            {
              label: "பயன்பாட்டுச் செயல்பாடுகள்:",
              text: "இணையதளம் எவ்வாறு பயன்படுத்தப்படுகிறது என்பதைப் புரிந்துகொள்ள வைத்திருக்கப்படும். ஒரு கணக்கு நீக்கப்பட்டால், அதன் செயல்பாடுகள் இனி அந்தக் கணக்குடன் இணைக்கப்படாது.",
            },
            {
              label: "புகார்கள், நிர்வாக மற்றும் பாதுகாப்புப் பதிவுகள்:",
              text: "பாதுகாப்பு, மோசடித் தடுப்பு, சட்டத் தேவைகள் ஆகியவற்றுக்குத் தேவைப்படும் காலம் வரை மட்டுமே வைத்திருக்கப்படும்.",
            },
          ],
        },
        {
          p: "“என் சுயவிவரம்” பக்கத்திலிருந்து உங்கள் கணக்கை எப்போது வேண்டுமானாலும் நீங்களே நீக்கலாம். அப்போது உங்கள் கணக்கு, பதிவுகள், புகைப்படங்கள், வீடியோக்கள், தனிப்பட்ட விவரங்கள் அனைத்தும் உடனடியாக நீக்கப்படும். நீக்கம் பற்றிய ஒரு சிறு பதிவை மட்டுமே வைத்திருப்போம்: அதன் தேதி, மறைக்கப்பட்ட வடிவில் உங்கள் மொபைல் எண் (உதாரணமாக, +91 98XXXXXX10), மீண்டும் மீண்டும் நிகழும் தவறான பயன்பாட்டைத் தடுக்க உதவும் அதன் மாற்றியமைக்கப்பட்ட (hash செய்யப்பட்ட) வடிவம். உங்கள் கணக்கை நீக்குமாறு எங்களிடம் கேட்டால், 30 நாட்களுக்குள் நீக்குவோம். இரண்டு நிலைகளிலும், சட்டப்படி வைத்திருக்க வேண்டிய அல்லது ஒரு சர்ச்சையைத் தீர்க்கத் தேவைப்படும் தகவல்களை மட்டுமே வைத்திருப்போம்.",
        },
      ],
    },
    {
      id: "security",
      title: "8. உங்கள் தரவை எவ்வாறு பாதுகாக்கிறோம்",
      blocks: [
        {
          list: [
            "ஒவ்வொரு பக்கமும் மறையாக்கப்பட்ட (HTTPS) இணைப்பு மூலம் வழங்கப்படுகிறது.",
            "கடவுச்சொற்களும் மீட்புக் குறியீடுகளும் மாற்றியமைக்கப்பட்ட (hash செய்யப்பட்ட) வடிவில் மட்டுமே சேமிக்கப்படுகின்றன.",
            "ஒவ்வொரு பயனரும் தங்களுடைய தரவை மட்டுமே மாற்ற முடியும் வகையில் தரவுத்தள விதிகள் அமைக்கப்பட்டுள்ளன; கால்நடை மருத்துவச் சான்றிதழ்கள் தனிப்பட்ட சேமிப்பகத்தில் வைக்கப்படுகின்றன.",
            "மீட்பு முயற்சிகளுக்கும், ஒரு நாளில் இடக்கூடிய புதிய பதிவுகளுக்கும் வரம்புகள் உள்ளதால், தவறான பயன்பாடு தடுக்கப்படுகிறது.",
            "அங்கீகரிக்கப்பட்ட சில குழு உறுப்பினர்கள் மட்டுமே நிர்வாகக் கருவிகளைப் பயன்படுத்த முடியும்; அவர்களின் செயல்கள் பதிவு செய்யப்படுகின்றன.",
          ],
        },
        {
          p: "எந்த இணையதளமும் முழுமையாகப் பாதுகாப்பானது அல்ல. உங்கள் கடவுச்சொல்லையும் மீட்புக் குறியீட்டையும் யாரிடமும் பகிர வேண்டாம். EquineTrade அவற்றைத் தொலைபேசி, SMS அல்லது WhatsApp மூலம் ஒருபோதும் கேட்காது. தரவு மீறல் உங்களைப் பாதித்தால், சட்டப்படி உங்களுக்கும் உரிய அதிகாரிகளுக்கும் தெரிவிப்போம்.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "9. உங்கள் உரிமைகளும் தேர்வுகளும்",
      blocks: [
        { p: "டிஜிட்டல் தனிப்பட்ட தரவுப் பாதுகாப்புச் சட்டம், 2023 உள்ளிட்ட இந்தியச் சட்டங்களின்படி, உங்களுக்குப் பின்வரும் உரிமைகள் உள்ளன:" },
        {
          list: [
            {
              label: "அணுகல்:",
              text: "உங்களைப் பற்றி நாங்கள் வைத்திருக்கும் தனிப்பட்ட தரவின் சுருக்கத்தையும், அதை எவ்வாறு பயன்படுத்துகிறோம் என்பதையும் கேட்டுப் பெறலாம்.",
            },
            {
              label: "திருத்தம்:",
              text: "உங்கள் பெயர், புகைப்படம், மாவட்டம், பதிவுகள் ஆகியவற்றை உங்கள் சுயவிவரம் மற்றும் பதிவுப் பக்கங்களில் நீங்களே புதுப்பிக்கலாம்; வேறு எதையும் திருத்த எங்களிடம் கேட்கலாம்.",
            },
            {
              label: "நீக்குதல்:",
              text: "உங்கள் பதிவுகளையோ முழுக் கணக்கையோ “என் சுயவிவரம்” பக்கத்திலிருந்து எப்போது வேண்டுமானாலும் நீங்களே நீக்கலாம்; அல்லது அதைச் செய்யுமாறு எங்களிடம் கேட்கலாம்.",
            },
            {
              label: "ஒப்புதலைத் திரும்பப் பெறுதல்:",
              text: "எப்போது வேண்டுமானாலும் இணையதளத்தைப் பயன்படுத்துவதை நிறுத்தி, உங்கள் கணக்கை நீக்கலாம். ஒப்புதலைத் திரும்பப் பெறுவதற்கு முன் நடந்தவற்றை இது பாதிக்காது.",
            },
            { label: "புகார் அளித்தல்:", text: "எங்கள் குறைதீர்ப்பு அலுவலரிடம் புகார் அளிக்கலாம் (பிரிவு 13-ஐப் பார்க்கவும்)." },
            {
              label: "நியமனம்:",
              text: "உங்கள் மரணம் அல்லது இயலாமை ஏற்பட்டால், உங்கள் சார்பாக இந்த உரிமைகளைப் பயன்படுத்த வேறொருவரை நியமிக்கலாம்.",
            },
          ],
        },
        {
          p: "இந்த உரிமைகளில் எதையாவது பயன்படுத்த, உங்கள் கணக்குடன் இணைக்கப்பட்ட மொபைல் எண்ணிலிருந்து எங்களைத் தொடர்புகொள்ளுங்கள், அல்லது உங்கள் மின்னஞ்சலில் அந்த எண்ணைக் குறிப்பிடுங்கள். கோரிக்கை உண்மையில் உங்களிடமிருந்துதான் வந்துள்ளது என்பதை உறுதிசெய்ய இது உதவும்.",
        },
      ],
    },
    {
      id: "age",
      title: "10. வயது வரம்பு",
      blocks: [
        {
          p: "EquineTrade 18 வயது மற்றும் அதற்கு மேற்பட்டவர்களுக்கு மட்டுமே. 18 வயதுக்குட்பட்ட எவரிடமிருந்தும் தெரிந்தே தனிப்பட்ட தரவைச் சேகரிப்பதில்லை. 18 வயதுக்குட்பட்ட ஒருவர் கணக்கை உருவாக்கியுள்ளார் என நீங்கள் கருதினால், எங்களைத் தொடர்புகொள்ளுங்கள்; அந்தக் கணக்கை நீக்குவோம்.",
        },
      ],
    },
    {
      id: "other-services",
      title: "11. பிற இணையதளங்களும் செயலிகளும்",
      blocks: [
        {
          p: "WhatsApp, உங்கள் தொலைபேசியின் அழைப்புச் செயலி, Google போன்ற பிறர் நடத்தும் சேவைகளுக்கான இணைப்புகள் இந்த இணையதளத்தில் உள்ளன. அவை உங்கள் தரவைக் கையாளும் விதத்திற்கு நாங்கள் பொறுப்பல்ல. அவற்றின் தனியுரிமைக் கொள்கைகளைப் படித்துப் பாருங்கள்.",
        },
      ],
    },
    {
      id: "changes",
      title: "12. இந்தக் கொள்கையில் மாற்றங்கள்",
      blocks: [
        {
          p: "இணையதளம் அல்லது சட்டம் மாறும்போது இந்தக் கொள்கையைப் புதுப்பிக்கக்கூடும். அப்போது மேலே உள்ள “கடைசியாகப் புதுப்பிக்கப்பட்டது” தேதியை மாற்றுவோம்; முக்கியமான மாற்றங்கள் குறித்து இணையதளத்தில் அறிவிப்பும் வெளியிடுவோம். மாற்றத்திற்குப் பிறகும் நீங்கள் இணையதளத்தைத் தொடர்ந்து பயன்படுத்தினால், புதுப்பிக்கப்பட்ட கொள்கையை ஏற்றுக்கொள்கிறீர்கள்.",
        },
      ],
    },
    {
      id: "contact",
      title: "13. குறைதீர்ப்பு அலுவலரும் தொடர்பும்",
      blocks: [
        { p: "உங்கள் தனிப்பட்ட தரவு குறித்த எந்தக் கேள்வி, கோரிக்கை அல்லது புகாருக்கும், எங்கள் குறைதீர்ப்பு அலுவலரைத் தொடர்புகொள்ளுங்கள்:" },
        {
          list: [
            { label: "பெயர்:", text: G.name },
            { label: "மின்னஞ்சல்:", text: G.email },
            { label: "முகவரி:", text: `${G.city}, தமிழ்நாடு, இந்தியா` },
          ],
        },
        {
          p: "உங்கள் புகாரைப் பெற்ற 24 மணி நேரத்திற்குள் ஒப்புகை அளிப்போம்; 15 நாட்களுக்குள் அதைத் தீர்க்க முயல்வோம். எங்கள் பதிலில் உங்களுக்குத் திருப்தி இல்லையெனில், இந்தியத் தரவுப் பாதுகாப்பு வாரியத்திடம் (Data Protection Board of India) புகார் அளிக்கலாம்.",
        },
      ],
    },
    {
      id: "language",
      title: "14. மொழி",
      blocks: [
        {
          p: "இந்தக் கொள்கை ஆங்கிலத்திலும் தமிழிலும் வழங்கப்படுகிறது. இரண்டு பதிப்புகளுக்கும் இடையே பொருள் வேறுபாடு இருந்தால், ஆங்கிலப் பதிப்பே செல்லுபடியாகும்.",
        },
      ],
    },
  ],
};

export const privacyPolicy = { en, ta };
