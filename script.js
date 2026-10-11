(function () {
  // Header com borda ao rolar + barra fixa de CTA no mobile
  var header = document.getElementById('header');
  var sticky = document.getElementById('sticky');
  var hero = document.getElementById('topo');
  var demo = document.getElementById('demo');
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    var passouHero = window.scrollY > hero.offsetHeight - 200;
    var noForm = demo.getBoundingClientRect().top < window.innerHeight * 0.8;
    sticky.classList.toggle('show', passouHero && !noForm);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal ao rolar
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Abas acessíveis (setas do teclado) — cada grupo .tabs funciona de forma independente
  Array.prototype.slice.call(document.querySelectorAll('.tabs:not([data-own])')).forEach(function (grupo) {
    var tabs = Array.prototype.slice.call(grupo.querySelectorAll('.tab'));
    function selecionar(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selecionar(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') selecionar(tabs[(i + 1) % tabs.length]);
        if (e.key === 'ArrowLeft') selecionar(tabs[(i - 1 + tabs.length) % tabs.length]);
      });
    });
  });

  // Formulário: máscara e validação em tempo real
  var form = document.getElementById('form');
  var nome = document.getElementById('nome');
  var whats = document.getElementById('whats');
  var verba = document.getElementById('verba');

  whats.addEventListener('input', function () {
    var d = whats.value.replace(/\D/g, '').slice(0, 11);
    var f = d;
    if (d.length > 6) f = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
    else if (d.length > 2) f = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    else if (d.length) f = '(' + d;
    whats.value = f;
    if (whats.closest('.field').classList.contains('bad')) validaWhats();
  });

  function marca(input, errId, msg) {
    var campo = input.closest('.field');
    document.getElementById(errId).textContent = msg;
    campo.classList.toggle('bad', !!msg);
    campo.classList.toggle('good', !msg);
    input.setAttribute('aria-invalid', !!msg);
    return !msg;
  }
  function validaNome() {
    return marca(nome, 'e-nome', nome.value.trim().split(/\s+/).filter(Boolean).length >= 1 && nome.value.trim().length >= 2 ? '' : 'Informe seu nome.');
  }
  function validaWhats() {
    var d = whats.value.replace(/\D/g, '');
    var ok = d.length === 11 && d[2] === '9' && !/^(\d)\1+$/.test(d);
    return marca(whats, 'e-whats', ok ? '' : 'Digite um WhatsApp com DDD, ex.: (11) 90000-0000.');
  }
  function validaVerba() {
    return marca(verba, 'e-verba', verba.value ? '' : 'Escolha uma faixa de verba.');
  }
  nome.addEventListener('blur', validaNome);
  whats.addEventListener('blur', validaWhats);
  verba.addEventListener('change', validaVerba);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = validaNome(), b = validaWhats(), c = validaVerba();
    if (!(a && b && c)) { form.querySelector('.bad input, .bad select').focus(); return; }
    // Ponto de integração: enviar para webhook do n8n/Supabase aqui.
    form.hidden = true;
    var ok = document.getElementById('ok');
    ok.hidden = false;
    ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Celular giratório: 3 cenários de mercado, cada um com um clique diferente
  var cenarios = [
    { mercado: 'Mercado Imobiliário', termo: '<b>apartamento à venda</b> em Belo Horizonte', clique: 0, resp: '✓ RELEVANTE. Termo mantido nas campanhas.' },
    { mercado: 'Monitor interativo', termo: '<b>monitor interativo</b> preço para escola', clique: 2, resp: '✓ TESTE A/B. Termo enviado para teste.' },
    { mercado: 'Alambrado', termo: '<b>alambrado</b> como fazer em casa passo a passo', clique: 1, resp: '✓ PERDA. Termo negativado.' }
  ];
  var opcoes = [
    { rotulo: 'RELEVANTE', cls: '' },
    { rotulo: 'PERDA', cls: 'opt--loss' },
    { rotulo: 'TESTE A/B', cls: 'opt--ab' }
  ];
  var spin = document.getElementById('spin');
  var faces = [document.getElementById('face-a'), document.getElementById('face-b')];
  if (spin && faces[0] && faces[1]) {
    var atual = 0;
    var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function monta(i, marcado, resposta) {
      var c = cenarios[i];
      var html = '<div class="phone__notch"></div>' +
        '<div class="phone__bar"><span class="avatar"><img src="assets/whatsapp-logo.jpg" alt=""></span><div><b>Grupo do cliente</b><small>Pocket · online</small></div></div>' +
        '<div class="chat' + (marcado >= 0 ? ' chat--still' : '') + '">' +
        '<div class="msg msg--mkt">' + c.mercado + '</div>' +
        '<div class="msg msg--in">Termo que acionou seu anúncio:<br>“' + c.termo + '”</div>' +
        '<div class="poll"><p>Como classificar este termo?</p>';
      opcoes.forEach(function (o, k) {
        html += '<label class="opt ' + o.cls + (marcado === k ? ' opt--on' : '') + '"><i></i>' + o.rotulo + '</label>';
      });
      html += '</div>' + (resposta ? '<div class="msg msg--ok">' + c.resp + '</div>' : '') + '</div>';
      return html;
    }
    function pinta(i, marcado, resposta) {
      var h = monta(i, marcado, resposta);
      faces[0].innerHTML = h; faces[1].innerHTML = h;
    }
    function ciclo() {
      pinta(atual, -1, false);
      later(function () { pinta(atual, cenarios[atual].clique, false); }, 1800);   // o "clique"
      later(function () { pinta(atual, cenarios[atual].clique, true); }, 2600);    // resposta do bot
      later(girar, 5600);
    }
    function girar() {
      var proximo = (atual + 1) % cenarios.length;
      if (reduz || !spin.animate) { atual = proximo; ciclo(); return; }
      spin.animate(
        [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(360deg)' }],
        { duration: 1800, easing: 'cubic-bezier(.65,0,.35,1)' }
      );
      later(function () { atual = proximo; pinta(atual, -1, false); }, 900); // aparelho de lado: troca invisível
      later(ciclo, 1800);
      // ciclo() repinta o mesmo cenário limpo e agenda clique/resposta/novo giro
    }
    ciclo();
  }

  // Simulação automática (aba Imóveis de luxo): celular em perspectiva que classifica sozinho
  var simPhone = document.getElementById('simphone');
  var simList = document.getElementById('simlist');
  if (simPhone && simList) {
    var simMercado = 'Imóveis de luxo';
    var simItens = [
      { termo: 'decorador para apartamento de luxo', clique: 1, resp: '✓ PERDA. Termo negativado.', cls: 'r', rot: 'Negativar', why: 'Busca por serviço, não por compra de imóvel. Clique desperdiçado.' },
      { termo: 'investimento imobiliário alto rendimento', clique: 2, resp: '✓ TESTE A/B. Termo enviado para teste.', cls: 'y', rot: 'Dúvida · testar', why: 'Pode ser fundo imobiliário ou compra direta. A pergunta vai para o WhatsApp para qualificar.' },
      { termo: 'cobertura duplex comprar', clique: 0, resp: '✓ RELEVANTE. Termo mantido nas campanhas.', cls: 'g', rot: 'Relevante', why: 'Intenção clara de compra. Manter e otimizar o lance.' }
    ];
    var simOpts = [
      { rotulo: 'RELEVANTE', cls: '' },
      { rotulo: 'PERDA', cls: 'opt--loss' },
      { rotulo: 'TESTE A/B', cls: 'opt--ab' }
    ];
    var simAtual = 0, simEstado = 0, simTimers = [], simVisivel = false;
    var simReduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lista de buscas (texto acessível, clicável)
    simItens.forEach(function (it, i) {
      var li = document.createElement('li');
      li.innerHTML = '<button type="button" class="simitem" data-i="' + i + '">' +
        '<span class="simitem__n">' + (i + 1) + '</span>' +
        '<span class="simitem__body"><small>Termo pesquisado</small><b>“' + it.termo + '”</b>' +
        '<span class="simitem__res"><span class="verdict verdict--' + it.cls + '">' + it.rot + '</span><span>' + it.why + '</span></span></span></button>';
      simList.appendChild(li);
    });
    var simBtns = Array.prototype.slice.call(simList.querySelectorAll('.simitem'));

    function simPinta(i, marcado, resposta) {
      var c = simItens[i];
      var h = '<div class="phone__notch"></div>' +
        '<div class="phone__bar"><span class="avatar"><img src="assets/whatsapp-logo.jpg" alt=""></span><div><b>Grupo do cliente</b><small>Pocket · online</small></div></div>' +
        '<div class="chat' + (marcado >= 0 ? ' chat--still' : '') + '">' +
        '<div class="msg msg--mkt">' + simMercado + '</div>' +
        '<div class="msg msg--in">Termo que acionou seu anúncio:<br>“<b>' + c.termo + '</b>”</div>' +
        '<div class="poll"><p>Como classificar este termo?</p>';
      simOpts.forEach(function (o, k) {
        h += '<label class="opt ' + o.cls + (marcado === k ? ' opt--on' : '') + '"><i></i>' + o.rotulo + '</label>';
      });
      h += '</div>' + (resposta ? '<div class="msg msg--ok">' + c.resp + '</div>' : '') + '</div>';
      simPhone.innerHTML = h;
    }
    function simMarca(i, aberto) {
      simBtns.forEach(function (b, k) {
        b.classList.toggle('is-active', k === i);
        b.classList.toggle('is-done', k === i && aberto);
        if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
    }
    function simLimpa() { simTimers.forEach(clearTimeout); simTimers = []; }
    function simLater(fn, ms) { simTimers.push(setTimeout(fn, ms)); }
    function simCiclo() {
      simLimpa();
      simPinta(simAtual, -1, false); simMarca(simAtual, false);
      if (simReduz) { simPinta(simAtual, simItens[simAtual].clique, true); simMarca(simAtual, true); return; }
      simLater(function () { simPinta(simAtual, simItens[simAtual].clique, false); }, 1600);
      simLater(function () { simPinta(simAtual, simItens[simAtual].clique, true); simMarca(simAtual, true); }, 2500);
      simLater(function () {
        simAtual = (simAtual + 1) % simItens.length;
        if (simPhone.animate) simPhone.animate([{ opacity: 1 }, { opacity: .15 }, { opacity: 1 }], { duration: 500 });
        simLater(simCiclo, 250);
      }, 6500);
    }
    simBtns.forEach(function (b) {
      b.addEventListener('click', function () { simAtual = +b.getAttribute('data-i'); if (simVisivel || simReduz) simCiclo(); });
    });

    // Só anima quando a seção está na tela
    var simSec = document.getElementById('simulacao');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        simVisivel = en[0].isIntersecting;
        if (simVisivel) simCiclo(); else simLimpa();
      }, { threshold: 0.25 }).observe(simSec);
    } else { simVisivel = true; simCiclo(); }
    simPinta(0, -1, false); simMarca(0, false);

    // Perspectiva reage ao mouse (desktop)
    var simWrap = document.getElementById('simphone-wrap');
    if (simWrap && !simReduz && window.matchMedia('(hover:hover)').matches) {
      simSec.addEventListener('pointermove', function (e) {
        var r = simWrap.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        var dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        simWrap.style.setProperty('--ry', (-16 + dx * 14).toFixed(1) + 'deg');
        simWrap.style.setProperty('--rx', (6 - dy * 10).toFixed(1) + 'deg');
      });
    }
  }

  // Gráfico do painel anima ao entrar na tela
  var dash = document.querySelector('.dash');
  if (dash && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en, ob) {
      if (en[0].isIntersecting) { dash.classList.add('in'); ob.disconnect(); }
    }, { threshold: 0.3 }).observe(dash);
  } else if (dash) { dash.classList.add('in'); }
})();
