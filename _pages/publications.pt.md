---
layout: page
permalink: /pt/publications/
title: publicações
description: Em ordem cronológica inversa. Geradas a partir de um único arquivo BibTeX.
lang: pt
ref: publications
nav: true
nav_order: 3
---

<!-- _pages/publications.pt.md -->

<!-- Tudo abaixo é gerado pelo jekyll-scholar a partir de _bibliography/papers.bib.
     Para acrescentar uma publicação, edite aquele arquivo — nada muda aqui.

     As entradas em si não são traduzidas: títulos de artigos, nomes de
     periódicos e de conferências são citados exatamente como publicados. -->

{% include bib_search.liquid %}

<div class="publications">

<!-- Relabels the "Code" button "GitHub"; see the comment in publications.md for
     why this is a substitution rather than a fork of _layouts/bib.liquid. -->
{% capture bibliography %}{% bibliography %}{% endcapture %}
{{ bibliography | replace: '>Code</a>', '>GitHub</a>' }}

</div>
