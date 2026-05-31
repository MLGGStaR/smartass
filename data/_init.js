// Global data store. Part files in data/ push into these arrays.
// Entry shape (who/what/where): { a:"Answer", init:"A.B.", clues:["broad...","...more specific..."] }
//   - clues go from very broad to very specific; the answer word must NOT appear in a clue.
// Entry shape (hard):          { q1:"...", a1:"...", q2:"...", a2:"..." }
window.GAME = { who: [], what: [], where: [], hard: [] };
