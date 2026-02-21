import { useState, useEffect, useReducer } from "react";

const FONTS_LINK = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap";

// ─── Data Constants ──────────────────────────────────────────
const DIET_TYPES = ["Balanced", "Keto", "Paleo", "Vegan", "Vegetarian", "Mediterranean", "Gluten-Free", "Whole30", "Low-FODMAP", "Carnivore"];
const ALLERGIES = ["Peanuts", "Tree Nuts", "Dairy", "Eggs", "Shellfish", "Fish", "Soy", "Wheat/Gluten", "Sesame", "Corn"];
const GOALS = ["Weight Loss", "Muscle Gain", "Heart Health", "Energy Boost", "Gut Health", "Anti-Inflammatory", "Kid-Friendly Nutrition", "General Wellness"];
const MEAL_TIMES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SAMPLE_MEALS = {
  Breakfast: [
    { name: "Avocado Toast w/ Poached Eggs", cal: 380, protein: 18, carbs: 32, fat: 22, pairings: ["Fresh Squeezed OJ", "Matcha Latte", "Mixed Berry Smoothie"] },
    { name: "Greek Yogurt Parfait", cal: 290, protein: 20, carbs: 38, fat: 8, pairings: ["Green Tea", "Cold Brew Coffee", "Kombucha"] },
    { name: "Spinach & Feta Omelette", cal: 340, protein: 26, carbs: 6, fat: 24, pairings: ["Sparkling Water w/ Lemon", "Turmeric Latte", "Fresh Grapefruit Juice"] },
    { name: "Overnight Oats w/ Berries", cal: 310, protein: 14, carbs: 48, fat: 10, pairings: ["Almond Milk Latte", "Chai Tea", "Coconut Water"] },
    { name: "Smoked Salmon Benedict", cal: 420, protein: 28, carbs: 30, fat: 22, pairings: ["Mimosa", "Earl Grey", "Cucumber Water"] },
    { name: "Banana Pancakes (GF)", cal: 350, protein: 12, carbs: 52, fat: 12, pairings: ["Maple Latte", "Hot Chocolate", "Apple Juice"] },
  ],
  Lunch: [
    { name: "Grilled Chicken Caesar Salad", cal: 420, protein: 38, carbs: 18, fat: 24, pairings: ["Sparkling Water", "Iced Green Tea", "Light White Wine"] },
    { name: "Mediterranean Quinoa Bowl", cal: 460, protein: 16, carbs: 58, fat: 18, pairings: ["Rosé", "Mint Lemonade", "Hibiscus Iced Tea"] },
    { name: "Thai Coconut Soup", cal: 380, protein: 22, carbs: 28, fat: 20, pairings: ["Jasmine Tea", "Lemongrass Cooler", "Coconut Water"] },
    { name: "Turkey & Avocado Wrap", cal: 440, protein: 32, carbs: 36, fat: 20, pairings: ["Iced Coffee", "Kombucha", "Sparkling Lemonade"] },
    { name: "Seared Tuna Poke Bowl", cal: 410, protein: 34, carbs: 42, fat: 14, pairings: ["Sake", "Ginger Ale", "Japanese Green Tea"] },
  ],
  Dinner: [
    { name: "Pan-Seared Salmon w/ Asparagus", cal: 480, protein: 42, carbs: 12, fat: 30, pairings: ["Sauvignon Blanc", "Sparkling Water w/ Dill", "Chardonnay"] },
    { name: "Herb-Crusted Rack of Lamb", cal: 560, protein: 44, carbs: 8, fat: 38, pairings: ["Cabernet Sauvignon", "Pinot Noir", "Pomegranate Spritzer"] },
    { name: "Mushroom Risotto", cal: 520, protein: 14, carbs: 68, fat: 22, pairings: ["Barolo", "Truffle-infused Water", "Pinot Grigio"] },
    { name: "Grilled Ribeye w/ Sweet Potato", cal: 620, protein: 48, carbs: 34, fat: 34, pairings: ["Malbec", "Old Fashioned", "Espresso Tonic"] },
    { name: "Lemon Herb Chicken Thighs", cal: 440, protein: 36, carbs: 16, fat: 26, pairings: ["Viognier", "Lavender Lemonade", "Rosé"] },
    { name: "Stuffed Bell Peppers (Vegan)", cal: 360, protein: 14, carbs: 48, fat: 14, pairings: ["Tempranillo", "Ginger Kombucha", "Cucumber Agua Fresca"] },
  ],
  Snack: [
    { name: "Hummus & Veggie Plate", cal: 180, protein: 8, carbs: 22, fat: 8, pairings: ["Mint Tea", "Sparkling Water"] },
    { name: "Protein Energy Balls", cal: 200, protein: 10, carbs: 24, fat: 10, pairings: ["Almond Milk", "Cold Brew"] },
    { name: "Charcuterie Mini Board", cal: 280, protein: 16, carbs: 12, fat: 20, pairings: ["Prosecco", "Craft Ginger Beer"] },
    { name: "Acai Bowl (Small)", cal: 240, protein: 6, carbs: 38, fat: 8, pairings: ["Coconut Water", "Green Juice"] },
  ],
};

const ROUTINE_SUGGESTIONS = [
  { time: "6:30 AM", activity: "Hydrate — 16oz warm lemon water", icon: "💧" },
  { time: "7:00 AM", activity: "Breakfast window opens", icon: "🌅" },
  { time: "10:00 AM", activity: "Morning snack / green tea", icon: "🍵" },
  { time: "12:30 PM", activity: "Lunch — largest meal of the day", icon: "☀️" },
  { time: "3:00 PM", activity: "Afternoon snack / movement break", icon: "🚶" },
  { time: "6:30 PM", activity: "Dinner — lighter, nutrient-dense", icon: "🌙" },
  { time: "8:30 PM", activity: "Herbal tea / wind-down routine", icon: "🫖" },
];

// ─── Utility ─────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── State Reducer ───────────────────────────────────────────
const initialState = {
  screen: "welcome", // welcome, onboarding, dashboard
  onboardingStep: 0,
  household: { name: "", familySize: 2, primaryGoal: "", notes: "" },
  profiles: [],
  currentProfileId: null,
  mealPlans: {}, // { profileId: { day: { mealTime: meal } } }
  activeDay: "Monday",
  activeMealTime: "Dinner",
  activeTab: "plan", // plan, track, routines, profiles
  showMealPicker: false,
  showPairings: null,
  editingProfile: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SCREEN": return { ...state, screen: action.payload };
    case "SET_ONBOARDING_STEP": return { ...state, onboardingStep: action.payload };
    case "UPDATE_HOUSEHOLD": return { ...state, household: { ...state.household, ...action.payload } };
    case "ADD_PROFILE": {
      const profiles = [...state.profiles, action.payload];
      return { ...state, profiles, currentProfileId: state.currentProfileId || action.payload.id };
    }
    case "UPDATE_PROFILE": {
      const profiles = state.profiles.map(p => p.id === action.payload.id ? { ...p, ...action.payload } : p);
      return { ...state, profiles };
    }
    case "REMOVE_PROFILE": {
      const profiles = state.profiles.filter(p => p.id !== action.payload);
      const mealPlans = { ...state.mealPlans };
      delete mealPlans[action.payload];
      const currentProfileId = state.currentProfileId === action.payload ? (profiles[0]?.id || null) : state.currentProfileId;
      return { ...state, profiles, mealPlans, currentProfileId };
    }
    case "SET_CURRENT_PROFILE": return { ...state, currentProfileId: action.payload };
    case "SET_MEAL": {
      const { profileId, day, mealTime, meal } = action.payload;
      const plans = { ...state.mealPlans };
      if (!plans[profileId]) plans[profileId] = {};
      if (!plans[profileId][day]) plans[profileId][day] = {};
      plans[profileId][day][mealTime] = meal;
      return { ...state, mealPlans: plans };
    }
    case "REMOVE_MEAL": {
      const { profileId, day, mealTime } = action.payload;
      const plans = { ...state.mealPlans };
      if (plans[profileId]?.[day]) {
        delete plans[profileId][day][mealTime];
      }
      return { ...state, mealPlans: plans };
    }
    case "SET_ACTIVE_DAY": return { ...state, activeDay: action.payload };
    case "SET_ACTIVE_MEAL_TIME": return { ...state, activeMealTime: action.payload };
    case "SET_TAB": return { ...state, activeTab: action.payload };
    case "TOGGLE_MEAL_PICKER": return { ...state, showMealPicker: action.payload };
    case "SHOW_PAIRINGS": return { ...state, showPairings: action.payload };
    case "SET_EDITING_PROFILE": return { ...state, editingProfile: action.payload };
    default: return state;
  }
}

// ─── Components ──────────────────────────────────────────────

function Icon({ name, size = 20 }) {
  const icons = {
    chef: "👨‍🍳", family: "👨‍👩‍👧‍👦", leaf: "🌿", heart: "❤️", star: "⭐",
    plus: "+", check: "✓", x: "✕", arrow: "→", back: "←",
    breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎",
    wine: "🍷", calendar: "📅", chart: "📊", clock: "🕐",
    person: "👤", child: "👶", edit: "✏️", trash: "🗑️",
  };
  return <span style={{ fontSize: size }}>{icons[name] || "•"}</span>;
}

// ─── Welcome Screen ──────────────────────────────────────────
function WelcomeScreen({ dispatch }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #1a1714 0%, #2c2520 40%, #3d2e24 70%, #1a1714 100%)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 30% 20%, rgba(196,164,120,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(168,130,82,0.06) 0%, transparent 50%)",
      }} />
      <div style={{
        opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(30px)",
        transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)", textAlign: "center", zIndex: 1, padding: "0 24px",
      }}>
        <div style={{ fontSize: 64, marginBottom: 24, filter: "drop-shadow(0 4px 20px rgba(196,164,120,0.3))" }}>🍽️</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 700,
          color: "#f5efe6", letterSpacing: "-1px", marginBottom: 8, lineHeight: 1.1,
        }}>
          Culinaire
        </h1>
        <p style={{
          fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(14px, 3vw, 18px)",
          color: "#c4a478", marginBottom: 48, letterSpacing: "2px",
        }}>
          Your Personal Chef Experience
        </p>
        <p style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,239,230,0.5)",
          maxWidth: 380, margin: "0 auto 48px", lineHeight: 1.7,
        }}>
          Bespoke meal planning, curated pairings, and personalized nutrition — crafted for your entire family.
        </p>
        <button onClick={() => dispatch({ type: "SET_SCREEN", payload: "onboarding" })} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: "1.5px",
          padding: "18px 48px", background: "linear-gradient(135deg, #c4a478, #a8824e)",
          color: "#1a1714", border: "none", borderRadius: 60, cursor: "pointer",
          transition: "all 0.4s", textTransform: "uppercase",
          boxShadow: "0 4px 30px rgba(196,164,120,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 40px rgba(196,164,120,0.4)"; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 30px rgba(196,164,120,0.3)"; }}
        >
          Begin Setup
        </button>
      </div>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(196,164,120,0.3), transparent)",
      }} />
    </div>
  );
}

// ─── Onboarding Flow ─────────────────────────────────────────
function OnboardingScreen({ state, dispatch }) {
  const [profileForm, setProfileForm] = useState({ name: "", age: "", type: "Adult", diet: "Balanced", allergies: [], goals: [] });
  const step = state.onboardingStep;
  const totalSteps = 4;

  const toggleItem = (arr, item) => arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const addProfile = () => {
    if (!profileForm.name.trim()) return;
    dispatch({
      type: "ADD_PROFILE",
      payload: { id: uid(), ...profileForm, allergies: [...profileForm.allergies], goals: [...profileForm.goals] },
    });
    setProfileForm({ name: "", age: "", type: "Adult", diet: "Balanced", allergies: [], goals: [] });
  };

  const canProceed = () => {
    if (step === 0) return state.household.name.trim().length > 0;
    if (step === 1) return state.profiles.length > 0;
    return true;
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1714", color: "#f5efe6",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Progress bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#1a1714" }}>
        <div style={{ display: "flex", gap: 4, padding: "16px 24px" }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2, transition: "background 0.5s",
              background: i <= step ? "linear-gradient(90deg, #c4a478, #d4b88a)" : "rgba(245,239,230,0.1)",
            }} />
          ))}
        </div>
        <div style={{ padding: "0 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(245,239,230,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>
            Step {step + 1} of {totalSteps}
          </span>
          {step > 0 && (
            <button onClick={() => dispatch({ type: "SET_ONBOARDING_STEP", payload: step - 1 })}
              style={{ background: "none", border: "none", color: "#c4a478", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans'" }}>
              <Icon name="back" size={12} /> Back
            </button>
          )}
        </div>
      </div>

      <div style={{ paddingTop: 80, maxWidth: 520, margin: "0 auto", padding: "80px 24px 120px" }}>
        {/* Step 0: Household */}
        {step === 0 && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              Welcome to Culinaire
            </h2>
            <p style={{ color: "rgba(245,239,230,0.5)", marginBottom: 36, lineHeight: 1.6 }}>
              Let's start with a few details about your household so we can craft the perfect culinary experience.
            </p>
            <label style={labelStyle}>Household Name</label>
            <input value={state.household.name} onChange={e => dispatch({ type: "UPDATE_HOUSEHOLD", payload: { name: e.target.value } })}
              placeholder="e.g. The Johnsons" style={inputStyle} />
            <label style={labelStyle}>How many people in your family?</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              {[1,2,3,4,5,6,"7+"].map(n => (
                <button key={n} onClick={() => dispatch({ type: "UPDATE_HOUSEHOLD", payload: { familySize: n } })}
                  style={{
                    ...chipStyle, width: 52, height: 52, borderRadius: "50%", fontSize: 16,
                    background: state.household.familySize === n ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.04)",
                    borderColor: state.household.familySize === n ? "#c4a478" : "rgba(245,239,230,0.1)",
                    color: state.household.familySize === n ? "#c4a478" : "rgba(245,239,230,0.6)",
                  }}>
                  {n}
                </button>
              ))}
            </div>
            <label style={labelStyle}>Primary Household Goal</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              {GOALS.map(g => (
                <button key={g} onClick={() => dispatch({ type: "UPDATE_HOUSEHOLD", payload: { primaryGoal: g } })}
                  style={{
                    ...chipStyle,
                    background: state.household.primaryGoal === g ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.04)",
                    borderColor: state.household.primaryGoal === g ? "#c4a478" : "rgba(245,239,230,0.1)",
                    color: state.household.primaryGoal === g ? "#c4a478" : "rgba(245,239,230,0.6)",
                  }}>
                  {g}
                </button>
              ))}
            </div>
            <label style={labelStyle}>Anything else we should know?</label>
            <textarea value={state.household.notes} onChange={e => dispatch({ type: "UPDATE_HOUSEHOLD", payload: { notes: e.target.value } })}
              placeholder="Preferences, schedule, lifestyle notes..." style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
          </div>
        )}

        {/* Step 1: Family Profiles */}
        {step === 1 && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              Family Profiles
            </h2>
            <p style={{ color: "rgba(245,239,230,0.5)", marginBottom: 32, lineHeight: 1.6 }}>
              Create a profile for each family member. Each person gets their own personalized meal plan.
            </p>

            {/* Existing profiles */}
            {state.profiles.map(p => (
              <div key={p.id} style={{
                background: "rgba(245,239,230,0.04)", border: "1px solid rgba(245,239,230,0.08)",
                borderRadius: 16, padding: 20, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <Icon name={p.type === "Child" ? "child" : "person"} size={18} />
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</span>
                    <span style={{
                      fontSize: 11, padding: "2px 10px", borderRadius: 20,
                      background: p.type === "Child" ? "rgba(130,200,180,0.15)" : "rgba(196,164,120,0.15)",
                      color: p.type === "Child" ? "#82c8b4" : "#c4a478",
                    }}>{p.type}{p.age ? `, ${p.age}` : ""}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(245,239,230,0.4)" }}>
                    {p.diet} {p.allergies.length > 0 ? `· ${p.allergies.length} allerg${p.allergies.length > 1 ? "ies" : "y"}` : ""}
                  </span>
                </div>
                <button onClick={() => dispatch({ type: "REMOVE_PROFILE", payload: p.id })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(245,239,230,0.3)", fontSize: 18 }}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))}

            {/* Add profile form */}
            <div style={{
              background: "rgba(245,239,230,0.02)", border: "1px dashed rgba(245,239,230,0.12)",
              borderRadius: 16, padding: 24, marginTop: 20,
            }}>
              <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 15, color: "#c4a478" }}>
                {state.profiles.length === 0 ? "Add your first family member" : "Add another member"}
              </p>
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Name</label>
                  <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="First name" style={inputStyle} />
                </div>
                <div style={{ width: 80 }}>
                  <label style={labelStyle}>Age</label>
                  <input value={profileForm.age} onChange={e => setProfileForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="—" style={inputStyle} />
                </div>
              </div>
              <label style={labelStyle}>Type</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["Adult", "Child", "Teen"].map(t => (
                  <button key={t} onClick={() => setProfileForm(f => ({ ...f, type: t }))}
                    style={{
                      ...chipStyle,
                      background: profileForm.type === t ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.04)",
                      borderColor: profileForm.type === t ? "#c4a478" : "rgba(245,239,230,0.1)",
                      color: profileForm.type === t ? "#c4a478" : "rgba(245,239,230,0.6)",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
              <label style={labelStyle}>Preferred Diet</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {DIET_TYPES.map(d => (
                  <button key={d} onClick={() => setProfileForm(f => ({ ...f, diet: d }))}
                    style={{
                      ...chipStyle, fontSize: 12,
                      background: profileForm.diet === d ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.04)",
                      borderColor: profileForm.diet === d ? "#c4a478" : "rgba(245,239,230,0.1)",
                      color: profileForm.diet === d ? "#c4a478" : "rgba(245,239,230,0.6)",
                    }}>
                    {d}
                  </button>
                ))}
              </div>
              <button onClick={addProfile} disabled={!profileForm.name.trim()}
                style={{
                  ...btnPrimary, width: "100%", opacity: profileForm.name.trim() ? 1 : 0.4,
                  cursor: profileForm.name.trim() ? "pointer" : "default",
                }}>
                Add Profile
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Allergies & Restrictions */}
        {step === 2 && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              Allergies & Restrictions
            </h2>
            <p style={{ color: "rgba(245,239,230,0.5)", marginBottom: 32, lineHeight: 1.6 }}>
              Select any allergies or dietary restrictions for each family member. This ensures every meal is safe and enjoyable.
            </p>
            {state.profiles.map(p => (
              <div key={p.id} style={{
                background: "rgba(245,239,230,0.03)", border: "1px solid rgba(245,239,230,0.08)",
                borderRadius: 16, padding: 24, marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <Icon name={p.type === "Child" ? "child" : "person"} size={18} />
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ALLERGIES.map(a => {
                    const active = p.allergies.includes(a);
                    return (
                      <button key={a} onClick={() => {
                        dispatch({ type: "UPDATE_PROFILE", payload: { id: p.id, allergies: active ? p.allergies.filter(x => x !== a) : [...p.allergies, a] } });
                      }} style={{
                        ...chipStyle, fontSize: 12,
                        background: active ? "rgba(220,100,100,0.15)" : "rgba(245,239,230,0.04)",
                        borderColor: active ? "rgba(220,100,100,0.4)" : "rgba(245,239,230,0.1)",
                        color: active ? "#e8a0a0" : "rgba(245,239,230,0.5)",
                      }}>
                        {active ? "⚠️ " : ""}{a}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Goals & Preferences */}
        {step === 3 && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
              Individual Goals
            </h2>
            <p style={{ color: "rgba(245,239,230,0.5)", marginBottom: 32, lineHeight: 1.6 }}>
              Select health and nutrition goals for each person. We'll tailor meal suggestions accordingly.
            </p>
            {state.profiles.map(p => (
              <div key={p.id} style={{
                background: "rgba(245,239,230,0.03)", border: "1px solid rgba(245,239,230,0.08)",
                borderRadius: 16, padding: 24, marginBottom: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <Icon name={p.type === "Child" ? "child" : "person"} size={18} />
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: "rgba(245,239,230,0.4)" }}>{p.diet}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {GOALS.map(g => {
                    const active = p.goals.includes(g);
                    return (
                      <button key={g} onClick={() => {
                        dispatch({ type: "UPDATE_PROFILE", payload: { id: p.id, goals: active ? p.goals.filter(x => x !== g) : [...p.goals, g] } });
                      }} style={{
                        ...chipStyle, fontSize: 12,
                        background: active ? "rgba(130,200,180,0.15)" : "rgba(245,239,230,0.04)",
                        borderColor: active ? "rgba(130,200,180,0.35)" : "rgba(245,239,230,0.1)",
                        color: active ? "#82c8b4" : "rgba(245,239,230,0.5)",
                      }}>
                        {active ? "✓ " : ""}{g}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: 40 }}>
          {step < totalSteps - 1 ? (
            <button onClick={() => dispatch({ type: "SET_ONBOARDING_STEP", payload: step + 1 })}
              disabled={!canProceed()}
              style={{ ...btnPrimary, width: "100%", opacity: canProceed() ? 1 : 0.4 }}>
              Continue <Icon name="arrow" size={14} />
            </button>
          ) : (
            <button onClick={() => dispatch({ type: "SET_SCREEN", payload: "dashboard" })}
              style={{ ...btnPrimary, width: "100%", background: "linear-gradient(135deg, #82c8b4, #5ea896)" }}>
              Launch My Dashboard <Icon name="arrow" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────
function Dashboard({ state, dispatch }) {
  const profile = state.profiles.find(p => p.id === state.currentProfileId);
  const plans = state.mealPlans[state.currentProfileId] || {};
  const dayPlan = plans[state.activeDay] || {};

  const getDayCals = (day) => {
    const dp = plans[day] || {};
    return Object.values(dp).reduce((sum, m) => sum + (m?.cal || 0), 0);
  };

  const weekCals = DAYS.reduce((sum, d) => sum + getDayCals(d), 0);
  const filledMeals = DAYS.reduce((sum, d) => sum + Object.keys(plans[d] || {}).length, 0);
  const totalSlots = DAYS.length * 4;

  return (
    <div style={{
      minHeight: "100vh", background: "#1a1714", color: "#f5efe6",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50, background: "rgba(26,23,20,0.92)",
        backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(245,239,230,0.06)",
        padding: "14px 20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, margin: 0 }}>Culinaire</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "rgba(245,239,230,0.4)" }}>{state.household.name}</span>
          </div>
        </div>
      </div>

      {/* Profile Switcher */}
      <div style={{ padding: "16px 20px 8px", overflowX: "auto", display: "flex", gap: 8 }}>
        {state.profiles.map(p => (
          <button key={p.id} onClick={() => dispatch({ type: "SET_CURRENT_PROFILE", payload: p.id })}
            style={{
              padding: "8px 18px", borderRadius: 24, border: "1px solid",
              fontFamily: "'DM Sans'", fontSize: 13, fontWeight: 500, cursor: "pointer",
              whiteSpace: "nowrap", transition: "all 0.3s",
              background: p.id === state.currentProfileId ? "rgba(196,164,120,0.15)" : "transparent",
              borderColor: p.id === state.currentProfileId ? "#c4a478" : "rgba(245,239,230,0.1)",
              color: p.id === state.currentProfileId ? "#c4a478" : "rgba(245,239,230,0.5)",
            }}>
            {p.type === "Child" ? "👶 " : ""}{p.name}
          </button>
        ))}
        <button onClick={() => dispatch({ type: "SET_TAB", payload: "profiles" })}
          style={{
            padding: "8px 14px", borderRadius: 24, border: "1px dashed rgba(245,239,230,0.15)",
            background: "transparent", color: "rgba(245,239,230,0.3)", cursor: "pointer",
            fontFamily: "'DM Sans'", fontSize: 13,
          }}>
          + Add
        </button>
      </div>

      {/* Profile Summary Bar */}
      {profile && (
        <div style={{ padding: "8px 20px 16px", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(196,164,120,0.1)", color: "#c4a478" }}>
            {profile.diet}
          </span>
          {profile.allergies.map(a => (
            <span key={a} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(220,100,100,0.1)", color: "#e8a0a0" }}>
              ⚠️ {a}
            </span>
          ))}
          {profile.goals.map(g => (
            <span key={g} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(130,200,180,0.1)", color: "#82c8b4" }}>
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div style={{
        display: "flex", padding: "0 20px", gap: 0, borderBottom: "1px solid rgba(245,239,230,0.06)",
      }}>
        {[
          { id: "plan", label: "Meal Plan", icon: "calendar" },
          { id: "track", label: "Tracking", icon: "chart" },
          { id: "routines", label: "Routines", icon: "clock" },
          { id: "profiles", label: "Profiles", icon: "family" },
        ].map(tab => (
          <button key={tab.id} onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
            style={{
              flex: 1, padding: "14px 8px", border: "none", background: "none", cursor: "pointer",
              fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, textAlign: "center",
              color: state.activeTab === tab.id ? "#c4a478" : "rgba(245,239,230,0.35)",
              borderBottom: state.activeTab === tab.id ? "2px solid #c4a478" : "2px solid transparent",
              transition: "all 0.3s",
            }}>
            <Icon name={tab.icon} size={16} /><br />{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "20px 20px 100px" }}>
        {state.activeTab === "plan" && (
          <MealPlanTab state={state} dispatch={dispatch} profile={profile} plans={plans} dayPlan={dayPlan} />
        )}
        {state.activeTab === "track" && (
          <TrackingTab plans={plans} weekCals={weekCals} filledMeals={filledMeals} totalSlots={totalSlots} profile={profile} />
        )}
        {state.activeTab === "routines" && (
          <RoutinesTab profile={profile} />
        )}
        {state.activeTab === "profiles" && (
          <ProfilesTab state={state} dispatch={dispatch} />
        )}
      </div>

      {/* Pairings Modal */}
      {state.showPairings && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => dispatch({ type: "SHOW_PAIRINGS", payload: null })}>
          <div style={{
            background: "#2c2520", borderRadius: "24px 24px 0 0", padding: "32px 24px 40px",
            width: "100%", maxWidth: 520, maxHeight: "60vh",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(245,239,230,0.15)", margin: "0 auto 24px" }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 8 }}>
              Suggested Pairings
            </h3>
            <p style={{ fontSize: 13, color: "rgba(245,239,230,0.4)", marginBottom: 24 }}>
              for {state.showPairings.name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {state.showPairings.pairings.map((p, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                  background: "rgba(245,239,230,0.04)", borderRadius: 14,
                  border: "1px solid rgba(245,239,230,0.06)",
                }}>
                  <Icon name="wine" size={20} />
                  <span style={{ fontSize: 15 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Meal Picker Modal */}
      {state.showMealPicker && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={() => dispatch({ type: "TOGGLE_MEAL_PICKER", payload: false })}>
          <div style={{
            background: "#2c2520", borderRadius: "24px 24px 0 0", padding: "32px 24px 40px",
            width: "100%", maxWidth: 520, maxHeight: "75vh", overflowY: "auto",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(245,239,230,0.15)", margin: "0 auto 24px" }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>
              Choose {state.activeMealTime}
            </h3>
            <p style={{ fontSize: 13, color: "rgba(245,239,230,0.4)", marginBottom: 24 }}>
              {state.activeDay} · {profile?.name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(SAMPLE_MEALS[state.activeMealTime] || []).map((meal, i) => (
                <button key={i} onClick={() => {
                  dispatch({ type: "SET_MEAL", payload: { profileId: state.currentProfileId, day: state.activeDay, mealTime: state.activeMealTime, meal } });
                  dispatch({ type: "TOGGLE_MEAL_PICKER", payload: false });
                }} style={{
                  display: "block", textAlign: "left", width: "100%", padding: "18px 20px",
                  background: "rgba(245,239,230,0.04)", border: "1px solid rgba(245,239,230,0.08)",
                  borderRadius: 14, cursor: "pointer", color: "#f5efe6", fontFamily: "'DM Sans'",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c4a478"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(245,239,230,0.08)"}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{meal.name}</div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "rgba(245,239,230,0.4)" }}>
                    <span>{meal.cal} cal</span>
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fat}g</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Meal Plan Tab ───────────────────────────────────────────
function MealPlanTab({ state, dispatch, profile, plans, dayPlan }) {
  return (
    <div>
      {/* Day Selector */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 24, paddingBottom: 4 }}>
        {DAYS.map(d => {
          const count = Object.keys(plans[d] || {}).length;
          return (
            <button key={d} onClick={() => dispatch({ type: "SET_ACTIVE_DAY", payload: d })}
              style={{
                padding: "10px 14px", borderRadius: 12, border: "1px solid",
                fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500, cursor: "pointer",
                whiteSpace: "nowrap", transition: "all 0.3s", position: "relative",
                background: state.activeDay === d ? "rgba(196,164,120,0.15)" : "rgba(245,239,230,0.03)",
                borderColor: state.activeDay === d ? "#c4a478" : "rgba(245,239,230,0.06)",
                color: state.activeDay === d ? "#c4a478" : "rgba(245,239,230,0.5)",
              }}>
              {d.slice(0, 3)}
              {count > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%",
                  background: "#c4a478", color: "#1a1714", fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, marginBottom: 4 }}>
          {state.activeDay}
        </h3>
        <p style={{ fontSize: 13, color: "rgba(245,239,230,0.4)" }}>
          {Object.keys(dayPlan).length} meals planned · {Object.values(dayPlan).reduce((s, m) => s + (m?.cal || 0), 0)} calories
        </p>
      </div>

      {/* Meal Slots */}
      {MEAL_TIMES.map(mt => {
        const meal = dayPlan[mt];
        const iconMap = { Breakfast: "breakfast", Lunch: "lunch", Dinner: "dinner", Snack: "snack" };
        return (
          <div key={mt} style={{
            background: "rgba(245,239,230,0.03)", border: "1px solid rgba(245,239,230,0.06)",
            borderRadius: 16, padding: 20, marginBottom: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: meal ? 12 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name={iconMap[mt]} size={18} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(245,239,230,0.7)" }}>{mt}</span>
              </div>
              {meal && (
                <button onClick={() => dispatch({ type: "REMOVE_MEAL", payload: { profileId: state.currentProfileId, day: state.activeDay, mealTime: mt } })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(245,239,230,0.25)", fontSize: 14 }}>
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>
            {meal ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{meal.name}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: "rgba(245,239,230,0.4)", marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(245,239,230,0.05)" }}>{meal.cal} cal</span>
                  <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(245,239,230,0.05)" }}>P {meal.protein}g</span>
                  <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(245,239,230,0.05)" }}>C {meal.carbs}g</span>
                  <span style={{ padding: "3px 10px", borderRadius: 8, background: "rgba(245,239,230,0.05)" }}>F {meal.fat}g</span>
                </div>
                <button onClick={() => dispatch({ type: "SHOW_PAIRINGS", payload: meal })}
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(196,164,120,0.3)",
                    background: "rgba(196,164,120,0.08)", color: "#c4a478", cursor: "pointer",
                    fontFamily: "'DM Sans'", fontSize: 12, fontWeight: 500,
                  }}>
                  <Icon name="wine" size={13} /> View Pairings
                </button>
              </div>
            ) : (
              <button onClick={() => { dispatch({ type: "SET_ACTIVE_MEAL_TIME", payload: mt }); dispatch({ type: "TOGGLE_MEAL_PICKER", payload: true }); }}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "1px dashed rgba(245,239,230,0.12)",
                  background: "transparent", color: "rgba(245,239,230,0.3)", cursor: "pointer",
                  fontFamily: "'DM Sans'", fontSize: 13, marginTop: 4,
                }}>
                + Add {mt}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tracking Tab ────────────────────────────────────────────
function TrackingTab({ plans, weekCals, filledMeals, totalSlots, profile }) {
  const avgDaily = weekCals / 7;
  const macros = DAYS.reduce((acc, d) => {
    Object.values(plans[d] || {}).forEach(m => {
      acc.protein += m?.protein || 0;
      acc.carbs += m?.carbs || 0;
      acc.fat += m?.fat || 0;
    });
    return acc;
  }, { protein: 0, carbs: 0, fat: 0 });
  const totalMacro = macros.protein + macros.carbs + macros.fat || 1;

  return (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>
        Weekly Overview
      </h3>
      <p style={{ fontSize: 13, color: "rgba(245,239,230,0.4)", marginBottom: 28 }}>
        {profile?.name}'s nutrition tracking
      </p>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Week Calories", value: weekCals.toLocaleString(), color: "#c4a478" },
          { label: "Daily Average", value: Math.round(avgDaily).toLocaleString(), color: "#82c8b4" },
          { label: "Meals Planned", value: `${filledMeals}/${totalSlots}`, color: "#a0b4e8" },
          { label: "Completion", value: `${Math.round((filledMeals / totalSlots) * 100)}%`, color: "#d4a0d4" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(245,239,230,0.03)", border: "1px solid rgba(245,239,230,0.06)",
            borderRadius: 16, padding: 20,
          }}>
            <div style={{ fontSize: 12, color: "rgba(245,239,230,0.4)", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Macro Breakdown */}
      <div style={{
        background: "rgba(245,239,230,0.03)", border: "1px solid rgba(245,239,230,0.06)",
        borderRadius: 16, padding: 24, marginBottom: 24,
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Macro Breakdown</div>
        <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
          <div style={{ width: `${(macros.protein / totalMacro) * 100}%`, background: "#82c8b4", transition: "width 0.5s" }} />
          <div style={{ width: `${(macros.carbs / totalMacro) * 100}%`, background: "#c4a478", transition: "width 0.5s" }} />
          <div style={{ width: `${(macros.fat / totalMacro) * 100}%`, background: "#a0b4e8", transition: "width 0.5s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {[
            { label: "Protein", val: macros.protein, color: "#82c8b4" },
            { label: "Carbs", val: macros.carbs, color: "#c4a478" },
            { label: "Fat", val: macros.fat, color: "#a0b4e8" },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(245,239,230,0.4)", marginBottom: 4 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: m.color, marginRight: 6 }} />
                {m.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: m.color }}>{m.val}g</div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Breakdown */}
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Daily Calories</div>
      {DAYS.map(d => {
        const dp = plans[d] || {};
        const dayCal = Object.values(dp).reduce((s, m) => s + (m?.cal || 0), 0);
        const maxCal = 2500;
        return (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ width: 36, fontSize: 12, color: "rgba(245,239,230,0.4)" }}>{d.slice(0, 3)}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(245,239,230,0.06)" }}>
              <div style={{
                height: "100%", borderRadius: 3, width: `${Math.min((dayCal / maxCal) * 100, 100)}%`,
                background: dayCal > 0 ? "linear-gradient(90deg, #c4a478, #82c8b4)" : "transparent",
                transition: "width 0.5s",
              }} />
            </div>
            <span style={{ width: 50, fontSize: 12, color: "rgba(245,239,230,0.5)", textAlign: "right" }}>{dayCal}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Routines Tab ────────────────────────────────────────────
function RoutinesTab({ profile }) {
  return (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>
        Daily Routine
      </h3>
      <p style={{ fontSize: 13, color: "rgba(245,239,230,0.4)", marginBottom: 28, lineHeight: 1.6 }}>
        A suggested daily rhythm optimized for {profile?.name}'s {profile?.goals?.[0] || "wellness"} goals.
      </p>

      <div style={{ position: "relative", paddingLeft: 28 }}>
        <div style={{
          position: "absolute", left: 8, top: 8, bottom: 8, width: 1,
          background: "linear-gradient(180deg, #c4a478, rgba(196,164,120,0.1))",
        }} />
        {ROUTINE_SUGGESTIONS.map((r, i) => (
          <div key={i} style={{
            display: "flex", gap: 16, marginBottom: 20, position: "relative",
          }}>
            <div style={{
              position: "absolute", left: -24, top: 4, width: 12, height: 12, borderRadius: "50%",
              background: "#2c2520", border: "2px solid #c4a478",
            }} />
            <div style={{ flex: 1, background: "rgba(245,239,230,0.03)", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(245,239,230,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 12, color: "#c4a478", fontWeight: 600 }}>{r.time}</span>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{r.activity}</div>
                </div>
                <span style={{ fontSize: 24 }}>{r.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 32, background: "rgba(130,200,180,0.08)", border: "1px solid rgba(130,200,180,0.15)",
        borderRadius: 16, padding: 24,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: "#82c8b4" }}>💡 Chef's Tip</div>
        <p style={{ fontSize: 14, color: "rgba(245,239,230,0.6)", lineHeight: 1.7, margin: 0 }}>
          Consistency with meal timing helps regulate metabolism and energy levels. Try to eat within the same 1-hour window each day. Hydration between meals improves nutrient absorption.
        </p>
      </div>
    </div>
  );
}

// ─── Profiles Tab ────────────────────────────────────────────
function ProfilesTab({ state, dispatch }) {
  const [newProfile, setNewProfile] = useState({ name: "", age: "", type: "Adult", diet: "Balanced", allergies: [], goals: [] });
  const [showAdd, setShowAdd] = useState(false);

  const addProfile = () => {
    if (!newProfile.name.trim()) return;
    dispatch({ type: "ADD_PROFILE", payload: { id: uid(), ...newProfile } });
    setNewProfile({ name: "", age: "", type: "Adult", diet: "Balanced", allergies: [], goals: [] });
    setShowAdd(false);
  };

  return (
    <div>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 4 }}>
        Family Profiles
      </h3>
      <p style={{ fontSize: 13, color: "rgba(245,239,230,0.4)", marginBottom: 24 }}>
        {state.household.name} · {state.profiles.length} members
      </p>

      {state.profiles.map(p => (
        <div key={p.id} style={{
          background: p.id === state.currentProfileId ? "rgba(196,164,120,0.06)" : "rgba(245,239,230,0.03)",
          border: `1px solid ${p.id === state.currentProfileId ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.06)"}`,
          borderRadius: 16, padding: 24, marginBottom: 12,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <Icon name={p.type === "Child" ? "child" : "person"} size={20} />
                <span style={{ fontWeight: 600, fontSize: 17 }}>{p.name}</span>
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: p.type === "Child" ? "rgba(130,200,180,0.12)" : p.type === "Teen" ? "rgba(160,180,232,0.12)" : "rgba(196,164,120,0.12)",
                  color: p.type === "Child" ? "#82c8b4" : p.type === "Teen" ? "#a0b4e8" : "#c4a478",
                }}>{p.type}{p.age ? ` · ${p.age}` : ""}</span>
              </div>
            </div>
            {state.profiles.length > 1 && (
              <button onClick={() => dispatch({ type: "REMOVE_PROFILE", payload: p.id })}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(245,239,230,0.25)", fontSize: 14 }}>
                <Icon name="trash" size={14} />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "rgba(196,164,120,0.08)", color: "#c4a478" }}>
              {p.diet}
            </span>
            {p.allergies.map(a => (
              <span key={a} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "rgba(220,100,100,0.08)", color: "#e8a0a0" }}>
                ⚠️ {a}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {p.goals.map(g => (
              <span key={g} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: "rgba(130,200,180,0.08)", color: "#82c8b4" }}>
                {g}
              </span>
            ))}
          </div>
        </div>
      ))}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)}
          style={{
            width: "100%", padding: 20, borderRadius: 16, border: "1px dashed rgba(245,239,230,0.15)",
            background: "transparent", color: "rgba(245,239,230,0.4)", cursor: "pointer",
            fontFamily: "'DM Sans'", fontSize: 14, marginTop: 8,
          }}>
          + Add Family Member
        </button>
      ) : (
        <div style={{
          background: "rgba(245,239,230,0.03)", border: "1px solid rgba(245,239,230,0.1)",
          borderRadius: 16, padding: 24, marginTop: 8,
        }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Name</label>
              <input value={newProfile.name} onChange={e => setNewProfile(f => ({ ...f, name: e.target.value }))}
                placeholder="First name" style={inputStyle} />
            </div>
            <div style={{ width: 80 }}>
              <label style={labelStyle}>Age</label>
              <input value={newProfile.age} onChange={e => setNewProfile(f => ({ ...f, age: e.target.value }))}
                placeholder="—" style={inputStyle} />
            </div>
          </div>
          <label style={labelStyle}>Type</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["Adult", "Child", "Teen"].map(t => (
              <button key={t} onClick={() => setNewProfile(f => ({ ...f, type: t }))}
                style={{
                  ...chipStyle,
                  background: newProfile.type === t ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.04)",
                  borderColor: newProfile.type === t ? "#c4a478" : "rgba(245,239,230,0.1)",
                  color: newProfile.type === t ? "#c4a478" : "rgba(245,239,230,0.6)",
                }}>
                {t}
              </button>
            ))}
          </div>
          <label style={labelStyle}>Diet</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {DIET_TYPES.map(d => (
              <button key={d} onClick={() => setNewProfile(f => ({ ...f, diet: d }))}
                style={{
                  ...chipStyle, fontSize: 12,
                  background: newProfile.diet === d ? "rgba(196,164,120,0.2)" : "rgba(245,239,230,0.04)",
                  borderColor: newProfile.diet === d ? "#c4a478" : "rgba(245,239,230,0.1)",
                  color: newProfile.diet === d ? "#c4a478" : "rgba(245,239,230,0.6)",
                }}>
                {d}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={addProfile} disabled={!newProfile.name.trim()} style={{ ...btnPrimary, flex: 1, opacity: newProfile.name.trim() ? 1 : 0.4 }}>
              Add Member
            </button>
            <button onClick={() => setShowAdd(false)} style={{ ...btnPrimary, flex: 0, padding: "12px 20px", background: "rgba(245,239,230,0.08)", color: "#f5efe6" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared Styles ───────────────────────────────────────────
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 500, color: "rgba(245,239,230,0.45)",
  marginBottom: 8, letterSpacing: "0.5px", textTransform: "uppercase",
};

const inputStyle = {
  width: "100%", padding: "14px 16px", borderRadius: 12,
  border: "1px solid rgba(245,239,230,0.1)", background: "rgba(245,239,230,0.04)",
  color: "#f5efe6", fontFamily: "'DM Sans', sans-serif", fontSize: 15,
  outline: "none", marginBottom: 20, boxSizing: "border-box",
};

const chipStyle = {
  padding: "8px 16px", borderRadius: 24, border: "1px solid",
  fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
  transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 4,
  background: "none",
};

const btnPrimary = {
  padding: "16px 32px", borderRadius: 14, border: "none",
  background: "linear-gradient(135deg, #c4a478, #a8824e)",
  color: "#1a1714", fontFamily: "'DM Sans', sans-serif", fontSize: 15,
  fontWeight: 600, cursor: "pointer", transition: "all 0.3s",
  display: "inline-flex", alignItems: "center", gap: 8, justifyContent: "center",
};

// ─── App Root ────────────────────────────────────────────────
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = FONTS_LINK;
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", background: "#1a1714", minHeight: "100vh" }}>
      {state.screen === "welcome" && <WelcomeScreen dispatch={dispatch} />}
      {state.screen === "onboarding" && <OnboardingScreen state={state} dispatch={dispatch} />}
      {state.screen === "dashboard" && <Dashboard state={state} dispatch={dispatch} />}
    </div>
  );
}
