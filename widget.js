// Fitness Tracker Medium Widget for Scriptable
// Medium size: 329x155 points
// Dark mode default, light mode supported
// Refresh: 15-30 min via Scriptable background refresh

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Vercel KV endpoint - REPLACE WITH YOUR URL
  kvUrl: "https://your-project.kv.vercel-storage.com/fitness-data",
  // Auth: "header" (Authorization: Bearer) or "query" (?token=)
  authMode: "header",
  authToken: "YOUR_KV_TOKEN_HERE",
  // Cache key for local storage
  cacheKey: "fitness_widget_cache",
  // Cache TTL: 4 hours (fallback if fetch fails)
  cacheTTL: 4 * 60 * 60 * 1000,
  // Widget dimensions (medium)
  width: 329,
  height: 155,
  // Colors
  colors: {
    protein: { dark: "#007AFF", light: "#0066CC" },      // Blue
    carbs: { dark: "#34C759", light: "#28A745" },        // Green
    fats: { dark: "#FF9F0A", light: "#E67E22" },         // Orange
    bg: { dark: "#1C1C1E", light: "#F2F2F7" },           // System background
    cardBg: { dark: "#2C2C2E", light: "#FFFFFF" },       // Card background
    text: { dark: "#FFFFFF", light: "#000000" },         // Primary text
    textSecondary: { dark: "#8E8E93", light: "#6D6D70" }, // Secondary text
    separator: { dark: "#38383A", light: "#C6C6C8" },    // Separator
    shadow: { dark: "rgba(0,0,0,0.4)", light: "rgba(0,0,0,0.1)" },
  },
  // SF Symbols
  icons: {
    protein: "figure.strengthtraining.traditional",
    carbs: "leaf",
    fats: "drop",
    workout: "figure.run",
    warning: "exclamationmark.triangle.fill",
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function isDarkMode() {
  return $device.isDarkMode;
}

function getColor(colorObj) {
  return isDarkMode() ? colorObj.dark : colorObj.light;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

// Dynamic Type scaling
function scaledFont(baseSize, weight = "regular") {
  const scale = $device.fontSizeScale || 1;
  const size = Math.round(baseSize * Math.min(Math.max(scale, 0.8), 1.3));
  return Font[weight.charAt(0).toUpperCase() + weight.slice(1)](size);
}

// Clamp value between min and max
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// ============================================
// DATA FETCHING & CACHING
// ============================================
async function fetchFitnessData() {
  const url = CONFIG.kvUrl;
  const headers = { "Content-Type": "application/json" };

  if (CONFIG.authMode === "header" && CONFIG.authToken) {
    headers["Authorization"] = `Bearer ${CONFIG.authToken}`;
  }

  const fetchUrl = CONFIG.authMode === "query" && CONFIG.authToken
    ? `${url}?token=${encodeURIComponent(CONFIG.authToken)}`
    : url;

  try {
    const req = new Request(fetchUrl);
    req.headers = headers;
    req.timeout = 10; // 10 second timeout

    const response = await req.loadJSON();

    if (response && response.data) {
      const data = {
        ...response.data,
        _fetchedAt: Date.now(),
        _source: "live",
      };
      // Cache successful response
      await cacheData(data);
      return data;
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.log("Fetch failed, trying cache:", error.message);
    return await getCachedData();
  }
}

async function cacheData(data) {
  try {
    const cache = {
      data: data,
      timestamp: Date.now(),
    };
    await Keychain.set(CONFIG.cacheKey, JSON.stringify(cache));
  } catch (e) {
    console.log("Cache write failed:", e.message);
  }
}

async function getCachedData() {
  try {
    const cached = await Keychain.get(CONFIG.cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CONFIG.cacheTTL) {
        return { ...parsed.data, _source: "cached", _cachedAt: parsed.timestamp };
      }
    }
  } catch (e) {
    console.log("Cache read failed:", e.message);
  }
  // Return mock data as ultimate fallback
  return getMockData();
}

function getMockData() {
  return {
    nutrition: {
      protein: { current: 142, target: 180 },
      carbs: { current: 210, target: 250 },
      fats: { current: 68, target: 80 },
    },
    workout: {
      status: "pending", // pending, in-progress, complete
      name: "Upper Body",
      duration: 45,
      completedAt: null,
    },
    _fetchedAt: Date.now(),
    _source: "mock",
  };
}

// ============================================
// GREETING LOGIC
// ============================================
function getGreeting(nutrition, workout) {
  const hour = new Date().getHours();
  const proteinProgress = nutrition.protein.current / nutrition.protein.target;
  const proteinRemaining = nutrition.protein.target - nutrition.protein.current;

  // Time-based greeting
  let timeGreeting = "";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 17) timeGreeting = "Good afternoon";
  else timeGreeting = "Good evening";

  // Protein progress modifier
  let proteinMessage = "";
  if (proteinProgress >= 1.0) {
    proteinMessage = "Target hit! 🎉";
  } else if (proteinProgress >= 0.85) {
    proteinMessage = `Almost there! ${proteinRemaining}g protein left.`;
  } else if (proteinProgress >= 0.6) {
    proteinMessage = `${proteinRemaining}g protein to go.`;
  } else {
    proteinMessage = `${proteinRemaining}g protein to go. Stay consistent!`;
  }

  // Workout status modifier
  let workoutMessage = "";
  if (workout.status === "complete") {
    workoutMessage = `Workout Complete 🔥`;
  } else if (workout.status === "in-progress") {
    workoutMessage = `Workout in progress...`;
  } else {
    workoutMessage = `Up Next: ${workout.duration} min ${workout.name}`;
  }

  // Combine based on priority
  if (workout.status === "complete") {
    return `${timeGreeting}! ${workoutMessage}`;
  }
  if (workout.status === "in-progress") {
    return `${timeGreeting}! ${workoutMessage}`;
  }
  if (proteinProgress >= 1.0) {
    return `${timeGreeting}! ${proteinMessage}`;
  }

  return `${timeGreeting}! ${proteinMessage}  •  ${workoutMessage}`;
}

// ============================================
// PROGRESS BAR RENDERING
// ============================================
function drawVerticalProgressBar(ctx, rect, progress, color, iconName, label, current, target) {
  const { x, y, width, height } = rect;
  const padding = 8;
  const barWidth = 16;
  const barHeight = height - padding * 2 - 40; // Space for icon, labels
  const barX = x + (width - barWidth) / 2;
  const barY = y + padding + 28; // Below icon

  // Background track
  ctx.addRoundedRect(
    barX, barY, barWidth, barHeight,
    barWidth / 2
  );
  ctx.setFillColor(new Color(getColor(CONFIG.colors.cardBg)));
  ctx.fillPath();

  // Progress fill (animated from bottom)
  const fillHeight = Math.max(2, barHeight * clamp(progress, 0, 1));
  const fillY = barY + barHeight - fillHeight;

  ctx.addRoundedRect(
    barX, fillY, barWidth, fillHeight,
    barWidth / 2
  );
  ctx.setFillColor(new Color(color));
  ctx.fillPath();

  // Icon
  const iconSize = 22;
  const iconX = x + (width - iconSize) / 2;
  const iconY = y + padding;
  const iconImage = ImageSF.fromSystemName(iconName, {
    pointSize: iconSize,
    weight: "semibold",
    scale: "large",
  });
  ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);

  // Label
  const labelFont = scaledFont(10, "medium");
  ctx.setFont(labelFont);
  ctx.setTextColor(new Color(getColor(CONFIG.colors.textSecondary)));
  const labelSize = ctx.measureText(label);
  ctx.drawText(label, x + (width - labelSize.width) / 2, barY + barHeight + 6);

  // Current/Target
  const valueText = `${current}/${target}g`;
  const valueFont = scaledFont(11, "semibold");
  ctx.setFont(valueFont);
  ctx.setTextColor(new Color(getColor(CONFIG.colors.text)));
  const valueSize = ctx.measureText(valueText);
  ctx.drawText(valueText, x + (width - valueSize.width) / 2, barY + barHeight + 22);

  // Percentage
  const pctText = `${Math.round(progress * 100)}%`;
  const pctFont = scaledFont(9, "regular");
  ctx.setFont(pctFont);
  ctx.setTextColor(new Color(getColor(CONFIG.colors.textSecondary)));
  const pctSize = ctx.measureText(pctText);
  ctx.drawText(pctText, x + (width - pctSize.width) / 2, barY + barHeight + 36);
}

// ============================================
// MAIN WIDGET RENDERING
// ============================================
async function renderWidget() {
  // Fetch data
  const data = await fetchFitnessData();
  const nutrition = data.nutrition;
  const workout = data.workout;

  // Create drawing context
  const ctx = new DrawContext();
  ctx.size = new Size(CONFIG.width, CONFIG.height);
  ctx.respectScreenScale = true;

  // Background
  const bgColor = getColor(CONFIG.colors.bg);
  ctx.setFillColor(new Color(bgColor));
  ctx.fillRect(new Rect(0, 0, CONFIG.width, CONFIG.height));

  // Main card with rounded corners (continuous curves)
  const cardInset = 8;
  const cardRect = new Rect(
    cardInset, cardInset,
    CONFIG.width - cardInset * 2,
    CONFIG.height - cardInset * 2
  );
  const cornerRadius = 24; // Continuous curve feel

  // Shadow
  ctx.setShadow(
    new Size(0, 4),
    12,
    new Color(getColor(CONFIG.colors.shadow))
  );

  // Card background
  ctx.addRoundedRect(cardRect, cornerRadius);
  ctx.setFillColor(new Color(getColor(CONFIG.colors.cardBg)));
  ctx.fillPath();

  // Clear shadow for content
  ctx.setShadow(new Size(0, 0), 0, new Color("clear"));

  // Inner content padding
  const innerPadding = 16;
  const contentX = cardRect.x + innerPadding;
  const contentY = cardRect.y + innerPadding;
  const contentWidth = cardRect.width - innerPadding * 2;
  const contentHeight = cardRect.height - innerPadding * 2;

  // ============================================
  // LEFT HALF: NUTRITION (3 vertical bars)
  // ============================================
  const leftWidth = contentWidth * 0.52;
  const barAreaWidth = leftWidth / 3;

  const proteinProgress = nutrition.protein.current / nutrition.protein.target;
  const carbsProgress = nutrition.carbs.current / nutrition.carbs.target;
  const fatsProgress = nutrition.fats.current / nutrition.fats.target;

  // Protein bar
  drawVerticalProgressBar(ctx, {
    x: contentX,
    y: contentY,
    width: barAreaWidth,
    height: contentHeight,
  }, proteinProgress, getColor(CONFIG.colors.protein),
    CONFIG.icons.protein, "Protein",
    nutrition.protein.current, nutrition.protein.target);

  // Carbs bar
  drawVerticalProgressBar(ctx, {
    x: contentX + barAreaWidth,
    y: contentY,
    width: barAreaWidth,
    height: contentHeight,
  }, carbsProgress, getColor(CONFIG.colors.carbs),
    CONFIG.icons.carbs, "Carbs",
    nutrition.carbs.current, nutrition.carbs.target);

  // Fats bar
  drawVerticalProgressBar(ctx, {
    x: contentX + barAreaWidth * 2,
    y: contentY,
    width: barAreaWidth,
    height: contentHeight,
  }, fatsProgress, getColor(CONFIG.colors.fats),
    CONFIG.icons.fats, "Fats",
    nutrition.fats.current, nutrition.fats.target);

  // ============================================
  // RIGHT HALF: GREETING & WORKOUT
  // ============================================
  const rightX = contentX + leftWidth + 12;
  const rightWidth = contentWidth - leftWidth - 12;

  // Greeting text
  const greeting = getGreeting(nutrition, workout);
  const greetingFont = scaledFont(15, "semibold");
  ctx.setFont(greetingFont);
  ctx.setTextColor(new Color(getColor(CONFIG.colors.text)));

  // Wrap greeting text
  const greetingLines = wrapText(ctx, greeting, rightWidth - 8);
  let textY = contentY + 16;
  for (const line of greetingLines) {
    ctx.drawText(line, rightX + 4, textY);
    textY += greetingFont.leading + 2;
  }

  // Divider
  textY += 8;
  ctx.setStrokeColor(new Color(getColor(CONFIG.colors.separator)));
  ctx.setLineWidth(0.5);
  ctx.drawLine(
    new Point(rightX, textY),
    new Point(rightX + rightWidth, textY)
  );
  textY += 16;

  // Workout detail
  const workoutFont = scaledFont(14, "medium");
  ctx.setFont(workoutFont);

  let workoutText = "";
  let workoutColor = getColor(CONFIG.colors.text);

  if (workout.status === "complete") {
    workoutText = `✓  Completed: ${workout.duration} min ${workout.name}`;
    workoutColor = getColor(CONFIG.colors.carbs);
  } else if (workout.status === "in-progress") {
    workoutText = `▶  In Progress: ${workout.name}`;
    workoutColor = getColor(CONFIG.colors.protein);
  } else {
    workoutText = `Next: ${workout.duration} min ${workout.name}`;
    workoutColor = getColor(CONFIG.colors.textSecondary);
  }

  ctx.setTextColor(new Color(workoutColor));
  ctx.drawText(workoutText, rightX + 4, textY);

  // Workout icon
  const workoutIcon = ImageSF.fromSystemName(CONFIG.icons.workout, {
    pointSize: 18,
    weight: "semibold",
    scale: "large",
  });
  const iconX = rightX + rightWidth - 28;
  ctx.drawImage(workoutIcon, iconX, textY - 14, 22, 22);

  // ============================================
  // DATA SOURCE INDICATOR (subtle)
  // ============================================
  if (data._source === "cached") {
    const cachedAt = new Date(data._cachedAt);
    const sourceText = `Cached ${formatTime(cachedAt)}`;
    const sourceFont = scaledFont(8, "regular");
    ctx.setFont(sourceFont);
    ctx.setTextColor(new Color(getColor(CONFIG.colors.textSecondary)));
    ctx.drawText(sourceText, contentX + 4, cardRect.maxY - 16);
  } else if (data._source === "mock") {
    const sourceText = "Demo Data";
    const sourceFont = scaledFont(8, "regular");
    ctx.setFont(sourceFont);
    ctx.setTextColor(new Color(getColor(CONFIG.colors.textSecondary)));
    ctx.drawText(sourceText, contentX + 4, cardRect.maxY - 16);
  }

  // Last updated (live data)
  if (data._source === "live" && data._fetchedAt) {
    const fetchedAt = new Date(data._fetchedAt);
    const sourceText = `Updated ${formatTime(fetchedAt)}`;
    const sourceFont = scaledFont(8, "regular");
    ctx.setFont(sourceFont);
    ctx.setTextColor(new Color(getColor(CONFIG.colors.textSecondary)));
    ctx.drawText(sourceText, contentX + 4, cardRect.maxY - 16);
  }

  // ============================================
  // ACCESSIBILITY
  // ============================================
  const widget = new ListWidget();
  widget.backgroundColor = new Color(bgColor);

  // VoiceOver summary
  const proteinPct = Math.round(proteinProgress * 100);
  const carbsPct = Math.round(carbsProgress * 100);
  const fatsPct = Math.round(fatsProgress * 100);

  widget.accessibilityLabel =
    `Fitness Tracker. ${greeting}. ` +
    `Protein ${nutrition.protein.current} of ${nutrition.protein.target} grams, ${proteinPct} percent. ` +
    `Carbs ${nutrition.carbs.current} of ${nutrition.carbs.target} grams, ${carbsPct} percent. ` +
    `Fats ${nutrition.fats.current} of ${nutrition.fats.target} grams, ${fatsPct} percent. ` +
    `Workout: ${workout.status === "complete" ? "Completed" : workout.status === "in-progress" ? "In progress" : "Up next"} ${workout.name} ${workout.duration} minutes.`;

  // Set the drawn image as widget background
  const img = ctx.getImage();
  widget.backgroundImage = img;

  // Set refresh interval (15-30 minutes)
  const refreshDate = new Date();
  refreshDate.setMinutes(refreshDate.getMinutes() + Math.floor(Math.random() * 15) + 15);
  widget.refreshAfterDate = refreshDate;

  return widget;
}

// Text wrapping helper
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const size = ctx.measureText(testLine);
    if (size.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ============================================
// ENTRY POINT
// ============================================
async function main() {
  const widget = await renderWidget();
  Script.setWidget(widget);
  Script.complete();
}

main();

// ============================================
// DEVELOPMENT HELPERS (run in Scriptable app)
// ============================================
// To test: Run this script in Scriptable, then add widget to home screen
// To debug: Check console output in Scriptable app
// To update: Modify CONFIG.kvUrl and CONFIG.authToken with your values