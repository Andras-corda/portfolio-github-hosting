document.addEventListener("DOMContentLoaded", () => {
  // Sélectionne l’élément contenant le Markdown brut
  const codeBlock = document.querySelector(".readme-section .code-block code");
  if (!codeBlock) return;

  // On récupère le texte brut (Markdown)
  const rawMarkdown = codeBlock.textContent;

  // On convertit en HTML
  const html = marked.parse(rawMarkdown);

  // On met le HTML dans un conteneur — tu peux remplacer “code-block” par un autre
  const container = codeBlock.parentElement;  // ici <pre><code>…</code></pre>
  container.innerHTML = html;
});