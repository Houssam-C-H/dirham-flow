import type { AppLanguage } from '../types/user';

export interface Translations {
  welcomeTitle: string;
  welcomeSubtitle: string;
  loginTab: string;
  registerTab: string;
  fullNameLabel: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  languageLabel: string;
  startWizardBtn: string;
  loginBtn: string;
  
  // Wizard Step Labels
  stepLabelAccounts: string;
  stepLabelBalances: string;
  stepLabelSalary: string;
  stepLabelDebts: string;
  stepLabelGoals: string;
  stepLabelSummary: string;

  // Wizard Steps Titles & Notices
  step1Title: string;
  step1Subtitle: string;
  step1Notice: string;
  step2Title: string;
  step2Subtitle: string;
  step2Notice: string;
  step3Title: string;
  step3Subtitle: string;
  step3Notice: string;
  step4Title: string;
  step4Subtitle: string;
  step4Notice: string;
  step5Title: string;
  step5Subtitle: string;
  step5Notice: string;
  step6Title: string;
  step6Subtitle: string;
  step6Notice: string;

  // Common Buttons & Form Labels
  btnBack: string;
  btnContinue: string;
  btnConfirmUnlock: string;
  btnAddAccount: string;
  btnAddDebt: string;
  btnAddGoal: string;
  btnNoDebt: string;
  btnYesDebt: string;
  
  instLabel: string;
  accTypeLabel: string;
  accNameLabel: string;
  initialBalLabel: string;
  asOfDateLabel: string;
  monthlySalaryLabel: string;
  payDayLabel: string;
  targetAccountLabel: string;
  debtTypeLabel: string;
  debtNameLabel: string;
  outstandingLabel: string;
  monthlyPaymentLabel: string;
  goalTitleLabel: string;
  goalTargetLabel: string;
  goalSavedLabel: string;

  // Header & Controls
  affordabilityBtn: string;
  transferBtn: string;
  importBtn: string;
  dashboardTab: string;
  salaryTab: string;
  accountsTab: string;
  billsTab: string;
  goalsTab: string;
  seasonalTab: string;
  settingsTab: string;

  // Seasonal Translation Keys
  seasonalQuestionHeader: string;
  chooseActivePeriod: string;
  activeModeTitle: string;
  dedicatedBudgetSubtitle: string;
  budgetAllocatedLabel: string;
  seasonalBudgetLabel: string;
  spentThisMonthLabel: string;
  remainingAvailableLabel: string;
  periodCategoriesLabel: string;
  plannedLabel: string;
  modeRamadan: string;
  modeEid: string;
  modeSummer: string;
  modeWedding: string;
  catCourses: string;
  catGifts: string;
  catSadaqa: string;
  catFamily: string;

  // Onboarding Wizard Streamlined i18n
  wizStep1Badge: string;
  wizStep1Question: string;
  wizStep1Sub: string;
  wizBankLabel: string;
  wizBankSub: string;
  wizCashLabel: string;
  wizCashSub: string;
  wizSavingsLabel: string;
  wizSavingsSub: string;
  wizStep2Badge: string;
  wizStep2Question: string;
  wizStep2Sub: string;
  wizFixedSalaryBtn: string;
  wizVariableIncomeBtn: string;
  wizMonthlySalaryLabel: string;
  wizPaydayLabel: string;
  wizStep3Badge: string;
  wizStep3Question: string;
  wizStep3Sub: string;
  wizAddCustomBill: string;
  wizBillAmountPlaceholder: string;
  wizStep4Badge: string;
  wizStep4Question: string;
  wizStep4Sub: string;
  wizGoalOpt1: string;
  wizGoalOpt2: string;
  wizGoalOpt3: string;
  wizGoalOpt4: string;
  wizReadyTitle: string;
  wizAvailableLabel: string;
  wizSalaryLabel: string;
  wizBillsLabel: string;
  wizGoalLabel: string;
  wizBtnBack: string;
  wizBtnNext: string;
  wizBtnFinish: string;
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  fr: {
    welcomeTitle: "Bienvenue sur DirhamFlow",
    welcomeSubtitle: "Prenez le contrôle de vos dirhams en toute sécurité",
    loginTab: "Connexion",
    registerTab: "Créer un compte",
    fullNameLabel: "Nom complet",
    emailLabel: "Adresse Email",
    passwordLabel: "Mot de passe",
    confirmPasswordLabel: "Confirmer le mot de passe",
    languageLabel: "Langue de l'application",
    startWizardBtn: "Établir ma situation financière ➔",
    loginBtn: "Se Connecter",

    stepLabelAccounts: "Comptes",
    stepLabelBalances: "Soldes Départ",
    stepLabelSalary: "Salaire",
    stepLabelDebts: "Dettes",
    stepLabelGoals: "Objectifs",
    stepLabelSummary: "Bilan",

    step1Title: "① Établissez vos Comptes & Établissements",
    step1Subtitle: "Ajoutez vos banques marocaines (CIH, Attijari, BCP...), votre portefeuille Cash (Espèces 💵) et vos cartes.",
    step1Notice: "💡 Guide DirhamFlow: Au Maroc, séparer votre Cash (Espèces) de vos comptes CIH/Attijari évite 80% des erreurs de compte.",
    
    step2Title: "② Soldes de Départ & Date de Référence ('As-of' Date)",
    step2Subtitle: "DirhamFlow commence le suivi à partir de cette date précise sans inventer de fausses transactions passées.",
    step2Notice: "💡 Guide DirhamFlow: DirhamFlow fixe un solde de départ à une date précise sans inventer de fausses transactions passées.",

    step3Title: "③ Configuration du Salaire & Revenu",
    step3Subtitle: "Recevez-vous un salaire fixe mensuel ou des revenus d'activité indépendante ?",
    step3Notice: "💡 Guide DirhamFlow: Connaître exactement votre jour de paye (ex: le 25) permet de calculer votre budget quotidien libre.",

    step4Title: "④ Dettes & Cartes à Débit Différé",
    step4Subtitle: "Avez-vous des dettes en cours ou un solde différé sur carte bancaire ?",
    step4Notice: "💡 Guide DirhamFlow: Différencier l'argent disponible de l'argent dépensable en intégrant vos remboursements mensuels.",

    step5Title: "⑤ Objectifs d'Épargne Marocains",
    step5Subtitle: "Fixez vos projets prioritaires (Fonds d'urgence, caution, véhicule, voyage Omra, mariage...).",
    step5Notice: "💡 Guide DirhamFlow: Vos objectifs sont intégrés dans le calculateur 'Puis-je acheter ?'.",

    step6Title: "⑥ VOTRE SITUATION FINANCIÈRE DE DÉPART",
    step6Subtitle: "Voici votre ligne de départ financière. Cliquez sur déverrouiller pour ouvrir votre tableau de bord.",
    step6Notice: "💡 Guide DirhamFlow: Voici votre ligne de départ financière. Cliquez sur déverrouiller pour ouvrir votre tableau de bord.",

    btnBack: "Retour",
    btnContinue: "Continuer ➔",
    btnConfirmUnlock: "Confirmer & Déverrouiller le Dashboard",
    btnAddAccount: "Ajouter ce compte",
    btnAddDebt: "Ajouter cette dette",
    btnAddGoal: "Ajouter cet objectif",
    btnNoDebt: "✅ Non, aucune dette",
    btnYesDebt: "💳 Oui, j'ai un crédit / dette",

    instLabel: "Établissement / Banque",
    accTypeLabel: "Type de compte",
    accNameLabel: "Nom du compte",
    initialBalLabel: "Solde Initial (DH)",
    asOfDateLabel: "Date d'Ouverture du Suivi ('As of Date')",
    monthlySalaryLabel: "Salaire Mensuel Brut / Net (DH)",
    payDayLabel: "Jour de Versement",
    targetAccountLabel: "Compte Domicilié",
    debtTypeLabel: "Type de dette",
    debtNameLabel: "Libellé / Nom",
    outstandingLabel: "Capital Restant Dû (DH)",
    monthlyPaymentLabel: "Mensualité (DH/mois)",
    goalTitleLabel: "Titre du projet",
    goalTargetLabel: "Objectif Cible (DH)",
    goalSavedLabel: "Déjà Épargné (DH)",

    affordabilityBtn: "🧠 Puis-je acheter ?",
    transferBtn: "🔄 Transfert",
    importBtn: "📄 Import Relevé",
    dashboardTab: "Tableau de bord",
    salaryTab: "Salaire & Budget",
    accountsTab: "Comptes & Espèces",
    billsTab: "Factures & Calendrier",
    goalsTab: "Objectifs d'Épargne",
    seasonalTab: "Saisonnier",
    settingsTab: "Profil & Paramètres",

    seasonalQuestionHeader: "Mode Saisonnier — Qu’est-ce qui change cette période ?",
    chooseActivePeriod: "Choisissez la période active :",
    activeModeTitle: "Mode Actif :",
    dedicatedBudgetSubtitle: "Budget dédié pour la période exceptionnelle",
    budgetAllocatedLabel: "Budget alloué :",
    seasonalBudgetLabel: "Budget Saisonnier",
    spentThisMonthLabel: "Dépensé ce mois",
    remainingAvailableLabel: "Reste Disponible",
    periodCategoriesLabel: "Catégories Principales de la Période :",
    plannedLabel: "Prévu :",
    modeRamadan: "Ramadan",
    modeEid: "Eid Al-Adha",
    modeSummer: "Vacances d'Été",
    modeWedding: "Mariage & Fêtes",
    catCourses: "Courses (التقضية)",
    catGifts: "Cadeaux (الهدايا)",
    catSadaqa: "Sadaqa (الصدقة)",
    catFamily: "Famille (الدار)",

    wizStep1Badge: "Étape 1 — Vos Soldes Actuels 🇲🇦",
    wizStep1Question: "Combien avez-vous actuellement ?",
    wizStep1Sub: "Indiquez simplement ce que vous possédez aujourd'hui pour démarrer votre suivi sans confusion.",
    wizBankLabel: "🏦 Compte Banque (CIH / Attijari)",
    wizBankSub: "Argent sur votre compte bancaire",
    wizCashLabel: "💵 Espèces (Cash Wallet)",
    wizCashSub: "Flesse ف الجيب (Argent liquide)",
    wizSavingsLabel: "💰 Compte Épargne (Livret)",
    wizSavingsSub: "Argent mis de côté",
    wizStep2Badge: "Étape 2 — Votre Salaire 💼",
    wizStep2Question: "Votre salaire mensuel ?",
    wizStep2Sub: "Pour calculer votre budget quotidien disponible chaque jour jusqu'au prochain virement.",
    wizFixedSalaryBtn: "💼 Salaire Fixe Mensuel",
    wizVariableIncomeBtn: "🔄 Pas de salaire fixe (Indépendant)",
    wizMonthlySalaryLabel: "Montant du Salaire Entrant Net (DH)",
    wizPaydayLabel: "Vous êtes payé le :",
    wizStep3Badge: "Étape 3 — Vos Paiements Fixes 📅",
    wizStep3Question: "Avez-vous des factures récurrentes ?",
    wizStep3Sub: "Sélectionnez les dépenses automatiques à déduire de votre solde.",
    wizAddCustomBill: "+ Autre facture (ex: Salle de sport)",
    wizBillAmountPlaceholder: "Montant DH",
    wizStep4Badge: "Étape 4 — Vos Objectifs 🎯",
    wizStep4Question: "Que voulez-vous améliorer ?",
    wizStep4Sub: "DirhamFlow adaptera ses conseils et alertes selon votre priorité.",
    wizGoalOpt1: "○ Mieux gérer mon argent au quotidien",
    wizGoalOpt2: "○ Épargner pour un projet (Voiture, Urgence)",
    wizGoalOpt3: "○ Réduire mes dépenses inutiles",
    wizGoalOpt4: "○ Préparer un projet familial / Mariage / Omra",
    wizReadyTitle: "🎉 C'est prêt ! Votre situation :",
    wizAvailableLabel: "Disponible:",
    wizSalaryLabel: "Salaire:",
    wizBillsLabel: "Factures:",
    wizGoalLabel: "Objectif:",
    wizBtnBack: "Retour",
    wizBtnNext: "Suivant ➔",
    wizBtnFinish: "Voir mon tableau de bord 🚀"
  },
  ar_darija: {
    welcomeTitle: "مرحبا بك ف فلوسي (DirhamFlow)",
    welcomeSubtitle: "تحكم ف دراهملك و اعرف فين كيمشيو فلوسك ف الأمان",
    loginTab: "تسجيل الدخول",
    registerTab: "حساب جديد",
    fullNameLabel: "السمية الكاملة",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة السر",
    confirmPasswordLabel: "تأكيد كلمة السر",
    languageLabel: "لغة التطبيق",
    startWizardBtn: "بدا تنظيم فلوسك دابا ➔",
    loginBtn: "دخول",

    stepLabelAccounts: "الحسابات",
    stepLabelBalances: "الفلوس الأولى",
    stepLabelSalary: "الخلصة",
    stepLabelDebts: "الكريات",
    stepLabelGoals: "الأهداف",
    stepLabelSummary: "الملخص",

    step1Title: "① دخل الحسابات و البنوك ديالك",
    step1Subtitle: "زيد البنوك المغربية ديالك (CIH, Attijari, البنك الشعبي...) و الفلوس د الجيب (Cash 💵).",
    step1Notice: "💡 نصيحة فلوسي: ف المغرب، ضروري تعزل الفلوس الكاش (ف الجيب) على حساب البنك (CIH, Attijari) باش تحسب صح.",

    step2Title: "② الفلوس لي عندك ف الأول و التاريخ",
    step2Subtitle: "فلوسي كيبدا يحسب من هاد التاريخ بلا ما يخترع مصاريف قديمة.",
    step2Notice: "💡 نصيحة فلوسي: التطبيق كيبدا يحسب من التاريخ لي حددتي بلا ما يخترع مصاريف قديمة.",

    step3Title: "③ تنظيم الخلصة و المدخول",
    step3Subtitle: "واش عندك خلصة شهرية ثابتة ولا مدخول حرة / متغيّر؟",
    step3Notice: "💡 نصيحة فلوسي: كيخصنا نعرفو نهار الخلصة (مثلا نهار 25) باش نحسبو ليك شحال تقدر تصرف ف اليوم.",

    step4Title: "④ الكريات و اقتطاعات Carte Crédit",
    step4Subtitle: "واش عندك شي كريدي ولا Carte Crédit ف البنك كينقص ليك الفلوس؟",
    step4Notice: "💡 نصيحة فلوسي: الكريات و الاقتطاعات كينقصو من الفلوس لي تقدر تصرفها بحرية.",

    step5Title: "⑤ أهداف التوفير (الفلوس لي مخبي)",
    step5Subtitle: "حدد المشاريع ديالك (فلوس الطوارئ، السيارة، العرس، السفر...)",
    step5Notice: "💡 نصيحة فلوسي: أهداف التوفير كيتأخذو ف العين الاعتبار ف حاسبة 'واش قدر نشري؟'.",

    step6Title: "⑥ الوضعية المالية ديالك ف البداية",
    step6Subtitle: "هادي هي النقطة د الانطلاق ديالك. برك على تأكيد باش تفتح لوحة التحكم.",
    step6Notice: "💡 نصيحة فلوسي: هادي هي النقطة د الانطلاق ديالك. برك على تأكيد باش تفتح لوحة التحكم.",

    btnBack: "رجوع",
    btnContinue: "متابعة ➔",
    btnConfirmUnlock: "تأكيد و فتح لوحة التحكم",
    btnAddAccount: "إضافة هذا الحساب",
    btnAddDebt: "إضافة هذا الدين",
    btnAddGoal: "إضافة هذا الهدف",
    btnNoDebt: "✅ لا، ما عندي حتى كريدي",
    btnYesDebt: "💳 نعم، عندي كريدي / اقتطاع",

    instLabel: "المؤسسة / البنك",
    accTypeLabel: "نوع الحساب",
    accNameLabel: "اسم الحساب",
    initialBalLabel: "المبلغ الحالي (درهم)",
    asOfDateLabel: "تاريخ بداية التتبع",
    monthlySalaryLabel: "الخلصة الشهرية (درهم)",
    payDayLabel: "يوم الخلصة",
    targetAccountLabel: "الحساب المعتمد للخلصة",
    debtTypeLabel: "نوع الدين",
    debtNameLabel: "اسم الدين",
    outstandingLabel: "المبلغ المتبقي (درهم)",
    monthlyPaymentLabel: "الاقتطاع الشهري (درهم)",
    goalTitleLabel: "اسم المشروع / الهدف",
    goalTargetLabel: "المبلغ المستهدف (درهم)",
    goalSavedLabel: "المبلغ الموفر حاليا (درهم)",

    affordabilityBtn: "🧠 واش قدر نشري ؟",
    transferBtn: "🔄 تحويل",
    importBtn: "📄 استيراد البنك",
    dashboardTab: "لوحة التحكم",
    salaryTab: "الخلصة و الميزانية",
    accountsTab: "الحسابات و الكاش",
    billsTab: "الفواتير و التقويم",
    goalsTab: "أهداف التوفير",
    seasonalTab: "المناسبات",
    settingsTab: "الملف الشخصي و الإعدادات",

    seasonalQuestionHeader: "المناسبات — شنو كيتغير ف هاد الفترة ؟",
    chooseActivePeriod: "اختار المناسبة الحالية :",
    activeModeTitle: "المناسبة الحالية :",
    dedicatedBudgetSubtitle: "ميزانية خاصة بهاد المناسبة الاستثنائية",
    budgetAllocatedLabel: "الميزانية المحددة :",
    seasonalBudgetLabel: "ميزانية المناسبة",
    spentThisMonthLabel: "المصروف هاد الشهر",
    remainingAvailableLabel: "المتبقي المتوفر",
    periodCategoriesLabel: "المصاريف الرئيسية ديال هاد المناسبة :",
    plannedLabel: "المتوقع :",
    modeRamadan: "رمضان المبارك",
    modeEid: "عيد الأضحى",
    modeSummer: "عطلة الصيف",
    modeWedding: "العرس و المناسبات",
    catCourses: "التقضية و الماكلة",
    catGifts: "الهدايا و العراضات",
    catSadaqa: "الصدقة و الزكاة",
    catFamily: "العائلة و الدار",

    wizStep1Badge: "الخطوة 1 — الفلوس لي عندك حاليا 🇲🇦",
    wizStep1Question: "شحال عندك د الفلوس حاليا ؟",
    wizStep1Sub: "دخل غير الفلوس لي عندك اليوم باش تبدا التتبع بكل سهولة.",
    wizBankLabel: "🏦 حساب البنك (CIH / Attijari)",
    wizBankSub: "الفلوس لي عندك ف البنك",
    wizCashLabel: "💵 الفلوس الكاش (ف الجيب)",
    wizCashSub: "الفلوس لي ف جيبك كاش",
    wizSavingsLabel: "💰 حساب التوفير (مخبين)",
    wizSavingsSub: "الفلوس لي مخبيهم للمستقبل",
    wizStep2Badge: "الخطوة 2 — الخلصة ديالك 💼",
    wizStep2Question: "شحال الخلصة الشهرية ديالك ؟",
    wizStep2Sub: "باش نحسبو ليك ميزانية اليوم المتوفرة حتى تجيك الخلصة الجاية.",
    wizFixedSalaryBtn: "💼 خلصة شهرية ثابثة",
    wizVariableIncomeBtn: "🔄 مدخول حرة / متغير (Freelance)",
    wizMonthlySalaryLabel: "مبلغ الخلصة الصافية (درهم)",
    wizPaydayLabel: "فاينا نهار كتجيك الخلصة :",
    wizStep3Badge: "الخطوة 3 — المصاريف الثابتة 📅",
    wizStep3Question: "واش عندك فواتير و اقتطاعات شهرية ؟",
    wizStep3Sub: "اختار الاقتطاعات الشهرية لي كتمشي ليك من البنك.",
    wizAddCustomBill: "+ فاتورة أخرى (مثلا: لاصال)",
    wizBillAmountPlaceholder: "المبلغ بالدرهم",
    wizStep4Badge: "الخطوة 4 — الأهداف ديالك 🎯",
    wizStep4Question: "شنو الهدف الرئيسي ديالك ف فلوسي ؟",
    wizStep4Sub: "فلوسي غادي يوجه ليك نصائح على حساب الهدف ديالك.",
    wizGoalOpt1: "○ نعرف فين كيمشيو فلوسي و ننظم المصاريف",
    wizGoalOpt2: "○ نوفر الفلوس لمشروع (سيارة، طوارئ)",
    wizGoalOpt3: "○ ننقص المصاريف لي ماشي ضرورية",
    wizGoalOpt4: "○ نوجد لمناسبة عائلية / عرس / عمرة",
    wizReadyTitle: "🎉 كلشي ناضي ! الملخص ديالك :",
    wizAvailableLabel: "المتوفر:",
    wizSalaryLabel: "الخلصة:",
    wizBillsLabel: "الفواتير:",
    wizGoalLabel: "الهدف:",
    wizBtnBack: "رجوع",
    wizBtnNext: "التالي ➔",
    wizBtnFinish: "انتقل للوحة التحكم 🚀"
  },
  en: {
    welcomeTitle: "Welcome to DirhamFlow",
    welcomeSubtitle: "Master your Moroccan dirhams with precision and security",
    loginTab: "Log In",
    registerTab: "Create Account",
    fullNameLabel: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    languageLabel: "Preferred Language",
    startWizardBtn: "Start Financial Setup Wizard ➔",
    loginBtn: "Log In",

    stepLabelAccounts: "Accounts",
    stepLabelBalances: "Balances",
    stepLabelSalary: "Salary",
    stepLabelDebts: "Debts",
    stepLabelGoals: "Goals",
    stepLabelSummary: "Summary",

    step1Title: "① Setup Accounts & Institutions",
    step1Subtitle: "Add your Moroccan banks (CIH, Attijari, BCP...), Cash Wallet (Espèces 💵), and cards.",
    step1Notice: "💡 DirhamFlow Guide: In Morocco, keeping Cash Wallet separate from CIH/Attijari bank accounts prevents 80% of tracking errors.",

    step2Title: "② Opening Balances & 'As-of' Date",
    step2Subtitle: "DirhamFlow starts tracking from this precise date without inventing fake past transactions.",
    step2Notice: "💡 DirhamFlow Guide: DirhamFlow sets a starting balance on a specific date without inventing false past transactions.",

    step3Title: "③ Salary & Income Configuration",
    step3Subtitle: "Do you receive a regular monthly salary or self-employed income?",
    step3Notice: "💡 DirhamFlow Guide: Knowing your exact payday (e.g. 25th) allows calculating your safe available daily budget.",

    step4Title: "④ Debts & Credit Cards",
    step4Subtitle: "Do you have existing loans or deferred credit card balances?",
    step4Notice: "💡 DirhamFlow Guide: Distinguish available money from spendable money by factoring in monthly debt payments.",

    step5Title: "⑤ Moroccan Savings Goals",
    step5Subtitle: "Set your priority projects (Emergency fund, car, Omra, wedding...).",
    step5Notice: "💡 DirhamFlow Guide: Savings goals feed directly into the 'Can I afford this?' calculator.",

    step6Title: "⑥ YOUR FINANCIAL BASELINE",
    step6Subtitle: "This is your financial baseline. Click confirm to unlock your interactive dashboard.",
    step6Notice: "💡 DirhamFlow Guide: This is your financial baseline. Click confirm to unlock your interactive dashboard.",

    btnBack: "Back",
    btnContinue: "Continue ➔",
    btnConfirmUnlock: "Confirm & Unlock Dashboard",
    btnAddAccount: "Add this Account",
    btnAddDebt: "Add this Debt",
    btnAddGoal: "Add this Goal",
    btnNoDebt: "✅ No, no active debts",
    btnYesDebt: "💳 Yes, I have debt/loans",

    instLabel: "Bank / Institution",
    accTypeLabel: "Account Type",
    accNameLabel: "Account Name",
    initialBalLabel: "Current Balance (DH)",
    asOfDateLabel: "Tracking Start Date ('As of Date')",
    monthlySalaryLabel: "Monthly Salary (DH)",
    payDayLabel: "Payday Date",
    targetAccountLabel: "Salary Account",
    debtTypeLabel: "Debt Type",
    debtNameLabel: "Debt Name / Label",
    outstandingLabel: "Remaining Debt (DH)",
    monthlyPaymentLabel: "Monthly Payment (DH)",
    goalTitleLabel: "Project Title",
    goalTargetLabel: "Target Goal (DH)",
    goalSavedLabel: "Already Saved (DH)",

    affordabilityBtn: "🧠 Can I afford this?",
    transferBtn: "🔄 Transfer",
    importBtn: "📄 Statement Import",
    dashboardTab: "Dashboard",
    salaryTab: "Salary & Budget",
    accountsTab: "Accounts & Cash",
    billsTab: "Bills & Calendar",
    goalsTab: "Savings Goals",
    seasonalTab: "Seasonal Modes",
    settingsTab: "Profile & Settings",

    seasonalQuestionHeader: "Seasonal Modes — What changes this period?",
    chooseActivePeriod: "Choose the active period:",
    activeModeTitle: "Active Mode:",
    dedicatedBudgetSubtitle: "Dedicated budget for exceptional periods",
    budgetAllocatedLabel: "Allocated Budget:",
    seasonalBudgetLabel: "Seasonal Budget",
    spentThisMonthLabel: "Spent this month",
    remainingAvailableLabel: "Remaining Available",
    periodCategoriesLabel: "Main Period Categories:",
    plannedLabel: "Planned:",
    modeRamadan: "Ramadan",
    modeEid: "Eid Al-Adha",
    modeSummer: "Summer Holidays",
    modeWedding: "Wedding & Events",
    catCourses: "Groceries",
    catGifts: "Gifts & Hosting",
    catSadaqa: "Charity & Sadaqa",
    catFamily: "Family Support",

    wizStep1Badge: "Step 1 — Your Current Balances 🇲🇦",
    wizStep1Question: "How much do you currently have?",
    wizStep1Sub: "Simply enter what you own today to start tracking without confusion.",
    wizBankLabel: "🏦 Bank Account (CIH / Attijari)",
    wizBankSub: "Money in your bank account",
    wizCashLabel: "💵 Cash Wallet",
    wizCashSub: "Physical cash in your wallet",
    wizSavingsLabel: "💰 Savings Account",
    wizSavingsSub: "Money put aside for savings",
    wizStep2Badge: "Step 2 — Your Salary 💼",
    wizStep2Question: "What is your monthly salary?",
    wizStep2Sub: "To calculate your safe daily spendable budget until payday.",
    wizFixedSalaryBtn: "💼 Fixed Monthly Salary",
    wizVariableIncomeBtn: "🔄 Irregular / Freelance Income",
    wizMonthlySalaryLabel: "Net Monthly Salary (DH)",
    wizPaydayLabel: "You are paid on:",
    wizStep3Badge: "Step 3 — Recurring Bills 📅",
    wizStep3Question: "Do you have recurring bills?",
    wizStep3Sub: "Select recurring bills to deduct from your available balance.",
    wizAddCustomBill: "+ Custom Bill (e.g. Gym)",
    wizBillAmountPlaceholder: "Amount DH",
    wizStep4Badge: "Step 4 — Your Goal 🎯",
    wizStep4Question: "What would you like to achieve?",
    wizStep4Sub: "DirhamFlow will tailor advice based on your main priority.",
    wizGoalOpt1: "○ Master my daily money & spending",
    wizGoalOpt2: "○ Save money for a project (Car, Emergency)",
    wizGoalOpt3: "○ Cut unnecessary impulse spending",
    wizGoalOpt4: "○ Prepare for a milestone (Wedding, Omra)",
    wizReadyTitle: "🎉 You're all set! Your baseline:",
    wizAvailableLabel: "Available:",
    wizSalaryLabel: "Salary:",
    wizBillsLabel: "Bills:",
    wizGoalLabel: "Goal:",
    wizBtnBack: "Back",
    wizBtnNext: "Next ➔",
    wizBtnFinish: "Go to Dashboard 🚀"
  }
};
