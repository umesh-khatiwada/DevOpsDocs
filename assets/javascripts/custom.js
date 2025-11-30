// Custom site JavaScript: initializes mermaid diagrams and enhances UI
(function(){
  // Initialize mermaid if available
  if(window.mermaid && typeof window.mermaid.initialize === 'function'){
    try{
      window.mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    }catch(e){ console.warn('Mermaid init failed', e); }
  }

  // Back-to-top button
  function createBackToTop(){
    const btn = document.createElement('button');
    btn.className = 'md-back-to-top';
    btn.innerText = '↑';
    btn.title = 'Back to top';
    Object.assign(btn.style, {
      position: 'fixed', right: '18px', bottom: '18px', padding: '8px 10px',
      'border-radius': '8px', 'z-index': 9999, border: 'none', cursor: 'pointer',
      background: 'rgba(59,130,246,0.9)', color: '#fff', fontSize: '18px'
    });
    btn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
    document.body.appendChild(btn);
  }

  // Run when DOM ready
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createBackToTop);
  else createBackToTop();

})();
