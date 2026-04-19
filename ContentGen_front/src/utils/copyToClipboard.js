/**
 * Writes text to the clipboard.
 * Returns true on success, false on failure.
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
};

/**
 * Serialises a generated content item into a plain-text string
 * ready to be copied to the clipboard.
 */
export const buildContentText = (item) => {
  let txt = "";

  if (item.hook)         txt += `Hook: ${item.hook}\n\n`;
  if (item.title)        txt += `Title: ${item.title}\n\n`;
  if (item.introduction) txt += `${item.introduction}\n\n`;
  if (item.script)       txt += `Script: ${item.script}\n\n`;
  if (item.visual)       txt += `Visual: ${item.visual}\n\n`;
  if (item.audio)        txt += `Audio: ${item.audio}\n\n`;
  if (item.story)        txt += `Story: ${item.story}\n\n`;

  if (Array.isArray(item.headings)) {
    item.headings.forEach((h) => {
      txt += `## ${h.h2 || h.heading}\n${h.content}\n\n`;
    });
  }

  if (Array.isArray(item.steps)) {
    txt += "Steps:\n";
    item.steps.forEach((s, idx) => { txt += `${idx + 1}. ${s}\n`; });
    txt += "\n";
  }

  if (Array.isArray(item.keyPoints)) {
    txt += "Key Points:\n";
    item.keyPoints.forEach((p) => { txt += `• ${p}\n`; });
    txt += "\n";
  }

  if (item.conclusion)       txt += `Conclusion: ${item.conclusion}\n\n`;
  if (item.keywords?.length) txt += `Keywords: ${item.keywords.join(", ")}`;

  return txt;
};
