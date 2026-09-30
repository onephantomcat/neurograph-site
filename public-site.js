'use strict';
window.NEUROGRAPH_PUBLIC = true;
// Reports keep their stable source IDs; relative URLs support project Pages.
function publicLinks(root) {
  root.querySelectorAll('[href],[src]').forEach(element => {
    for (const attribute of ['href', 'src']) {
      const value = element.getAttribute(attribute);
      if (!value || !value.startsWith('/') || value.startsWith('//')) continue;
      if (value.startsWith('/api/source/')) {
        const id = decodeURIComponent(value.slice('/api/source/'.length).split('?')[0]);
        const source = data?.sources.find(item => item.id === id);
        if (source?.public_url) element.setAttribute(attribute, source.public_url);
        else if (element.tagName === 'A') {
          element.removeAttribute(attribute);
          element.removeAttribute('download');
          element.textContent = '本机研究材料';
        }
      } else if (value === '/api/plan.md') {
        element.setAttribute(attribute, './PROJECT_PLAN.md');
      } else if (value.startsWith('/qc')) {
        element.remove();
      } else {
        element.setAttribute(attribute, './' + value.slice(1));
      }
    }
  });
}
document.addEventListener('DOMContentLoaded', () => {
  publicLinks(document);
  new MutationObserver(() => publicLinks(document)).observe(document.body, {childList:true, subtree:true});
});
