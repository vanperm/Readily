/* ============================================================
   Readily: genre color coding
   Each genre gets its own accent hue, used on filter chips and
   as each card's glow/accent color. Independent of the brown
   site theme so genres stay visually distinguishable.
   ============================================================ */

const GENRE_COLORS = {
  "Mystery": "#3E6FD9",
  "Science Fiction": "#7C4DFF",
  "Romance": "#C9577A",
  "Fantasy": "#2F8F5B",
  "Non-Fiction": "#1E8F7A",
  "Horror": "#8B2F2F",
  "Poetry": "#9C6ADE",
  "Classic Literature": "#A6672B",
  "Self-Help": "#D98E2B",
  "Adventure": "#C1662A",
  "Fiction": "#4F5FA6"
};

function genreColor(genre) {
  return GENRE_COLORS[genre] || "#09090B";
}
