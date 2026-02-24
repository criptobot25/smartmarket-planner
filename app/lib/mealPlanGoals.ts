export const MEAL_PLAN_GOALS = ["cutting", "bulking", "maintenance"] as const;

export type MealPlanGoal = (typeof MEAL_PLAN_GOALS)[number];

type GoalFaq = {
  question: string;
  answer: string;
};

export type MealPlanGoalContent = {
  goal: MealPlanGoal;
  name: string;
  shortLabel: string;
  heroTitle: string;
  heroDescription: string;
  seoTitle: string;
  seoDescription: string;
  intentSummary: string;
  framework: string[];
  mealConstruction: string[];
  commonMistakes: string[];
  faq: GoalFaq[];
};

const GOAL_CONTENT: Record<MealPlanGoal, MealPlanGoalContent> = {
  cutting: {
    goal: "cutting",
    name: "Fat Loss",
    shortLabel: "Cutting",
    heroTitle: "Meal Plan for Cutting: Keep Muscle While Losing Fat",
    heroDescription: "A cutting meal plan should create a consistent calorie deficit while keeping protein high enough to preserve lean mass and training performance.",
    seoTitle: "Cutting Meal Plan | Fat Loss Without Muscle Loss",
    seoDescription: "Follow a practical cutting meal-plan framework with calorie deficit targets, high-protein meal structure, grocery guidance, and weekly adjustment rules.",
    intentSummary: "Use this page when your primary objective is to reduce body fat over 8-16 weeks with measurable weekly progress, stable hunger management, and minimal performance drop.",
    framework: [
      "Set a moderate deficit (usually 300-500 kcal/day) so adherence remains realistic for multiple weeks.",
      "Anchor each day around protein distribution across 3-5 meals to improve satiety and muscle retention.",
      "Use higher-volume foods (vegetables, fruit, legumes) to lower calorie density while keeping plates full.",
      "Adjust carbs around training sessions first before reducing total food variety.",
      "Review scale trend, waist data, and training quality weekly before making another cut in calories.",
    ],
    mealConstruction: [
      "Breakfast: lean protein + fruit + fiber-rich carb to control morning appetite.",
      "Lunch: high-protein bowl with vegetables, measured fats, and a moderate starch serving.",
      "Dinner: protein-forward plate, low-calorie vegetables, and carbs matched to evening training demand.",
      "Snacks: dairy, eggs, tuna/chicken alternatives, or protein shakes based on compliance needs.",
    ],
    commonMistakes: [
      "Cutting calories too aggressively and losing consistency within 10-14 days.",
      "Dropping protein intake while trying to save calories.",
      "Keeping hidden liquid calories that erase the planned deficit.",
      "Making daily changes instead of using weekly trend-based adjustments.",
    ],
    faq: [
      {
        question: "How much protein should a cutting meal plan include?",
        answer: "Most cutting phases work best with high protein intake spread through the day, then adjusting carbs and fats to maintain a sustainable calorie deficit.",
      },
      {
        question: "How fast should I lose weight during a cutting phase?",
        answer: "A steady rate is usually more sustainable than aggressive drops, because it protects training quality and lowers the risk of rebound eating.",
      },
      {
        question: "Should I remove carbs completely while cutting?",
        answer: "No. Carbs can remain in a cutting plan, especially around workouts, while total daily calories stay in deficit.",
      },
    ],
  },
  bulking: {
    goal: "bulking",
    name: "Muscle Gain",
    shortLabel: "Bulking",
    heroTitle: "Meal Plan for Bulking: Build Muscle with Controlled Surplus",
    heroDescription: "A quality bulking meal plan focuses on progressive training support, consistent protein intake, and a controlled calorie surplus to limit unnecessary fat gain.",
    seoTitle: "Bulking Meal Plan | Muscle Gain Nutrition Strategy",
    seoDescription: "Build a clean bulking meal plan with smart calorie surplus targets, progressive carb timing, grocery execution, and weekly growth adjustments.",
    intentSummary: "Use this page when your goal is to increase lean body mass over several months while maintaining digestion, training quality, and predictable body-composition changes.",
    framework: [
      "Start with a small surplus (often 150-300 kcal/day) and increase only when progress stalls.",
      "Keep protein consistent, then use carbs as the primary lever for training performance and recovery.",
      "Place the largest meals around your hardest sessions to improve output and appetite control.",
      "Use energy-dense but digestible foods to reach targets without excessive fullness.",
      "Track strength progression and body-weight trend weekly to calibrate the surplus.",
    ],
    mealConstruction: [
      "Breakfast: protein + larger carb base to improve training readiness.",
      "Lunch: balanced plate with protein, starch, vegetables, and sufficient fats.",
      "Dinner: high-carb, high-protein recovery meal post-session.",
      "Snacks: dairy, shakes, nuts, and easy-to-digest carbs to close intake gaps.",
    ],
    commonMistakes: [
      "Using a surplus that is too high and accumulating fat too quickly.",
      "Bulking with low meal quality, causing poor digestion and compliance.",
      "Underestimating hydration and sodium needs during higher-volume training.",
      "Skipping weekly reviews and keeping macros unchanged for too long.",
    ],
    faq: [
      {
        question: "How aggressive should a bulking calorie surplus be?",
        answer: "A conservative surplus is typically easier to manage and helps prioritize muscle gain over excessive fat accumulation.",
      },
      {
        question: "Do I need to eat every two hours while bulking?",
        answer: "Not necessarily. Meal frequency should match your appetite and schedule, as long as daily targets are met consistently.",
      },
      {
        question: "Can I bulk without feeling constantly full?",
        answer: "Yes. Choose more calorie-dense foods, liquid calories when needed, and distribute intake around training windows.",
      },
    ],
  },
  maintenance: {
    goal: "maintenance",
    name: "Weight Maintenance",
    shortLabel: "Maintenance",
    heroTitle: "Meal Plan for Maintenance: Keep Results and Daily Consistency",
    heroDescription: "A maintenance meal plan stabilizes weight while supporting performance, routine, and long-term dietary consistency without aggressive deficit or surplus cycles.",
    seoTitle: "Maintenance Meal Plan | Sustainable Nutrition Routine",
    seoDescription: "Maintain your body composition with a balanced meal-plan approach focused on routine, satiety, food variety, and small weekly adjustments.",
    intentSummary: "Use this page when your priority is stable energy, predictable hunger, and long-term consistency after a fat-loss or muscle-gain phase.",
    framework: [
      "Set calories around estimated maintenance and validate with a 2-3 week trend.",
      "Prioritize consistency in meal timing to reduce decision fatigue.",
      "Rotate protein, carb, and vegetable options weekly to prevent menu burnout.",
      "Keep flexible meal slots for social events without breaking weekly structure.",
      "Make small adjustments based on trend data rather than daily fluctuations.",
    ],
    mealConstruction: [
      "Breakfast: protein + moderate carbs to establish steady energy.",
      "Lunch: balanced plate with variety across protein and vegetable sources.",
      "Dinner: moderate-carb meal with fiber and quality fats for satiety.",
      "Snacks: simple repeatable options that prevent random grazing.",
    ],
    commonMistakes: [
      "Treating maintenance like a free-eating phase and drifting above targets.",
      "Removing meal structure after a successful cut or bulk.",
      "Using only scale weight and ignoring appetite, energy, and routine quality.",
      "Overreacting to short-term fluctuations caused by sodium or stress.",
    ],
    faq: [
      {
        question: "How do I know if my maintenance calories are correct?",
        answer: "If weekly body-weight trend and performance are stable over several weeks, your maintenance target is likely in the right range.",
      },
      {
        question: "Can maintenance include flexible meals?",
        answer: "Yes. Planned flexibility works well when your weekly structure and protein baseline remain consistent.",
      },
      {
        question: "Should I still track intake during maintenance?",
        answer: "Some tracking is useful, especially during transitions, but many people move to lighter monitoring once habits are stable.",
      },
    ],
  },
};

export function getMealPlanGoalContent(goal: string): MealPlanGoalContent | null {
  if (!MEAL_PLAN_GOALS.includes(goal as MealPlanGoal)) {
    return null;
  }

  return GOAL_CONTENT[goal as MealPlanGoal];
}
