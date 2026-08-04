---
layout: about
lang: pt
ref: about
nav: true
nav_order: 1
title: sobre
permalink: /pt/
subtitle: >
  Doutorando, <a href="https://www.poli.usp.br/">Escola Politécnica</a>,
  <a href="https://www5.usp.br/">Universidade de São Paulo</a> ·
  Departamento de Engenharia Mecatrônica e de Sistemas Mecânicos

profile:
  align: right
  image: prof_pic.jpg
  image_circular: false # um recorte circular cortaria mal esta foto em paisagem
  more_info: >
    <p>Escola Politécnica, USP</p>
    <p>Av. Prof. Mello Moraes, 2231</p>
    <p>São Paulo, SP 05508-030, Brasil</p>

selected_papers: true # inclui os artigos marcados com "selected={true}"
social: true

announcements:
  enabled: false
  scrollable: true
  limit: 5

latest_posts:
  enabled: false # o blog está desativado
  scrollable: true
  limit: 3
---

Sou doutorando em ingresso direto na Escola Politécnica da Universidade de São
Paulo, no Departamento de Engenharia Mecatrônica e de Sistemas Mecânicos. Minha
pesquisa é financiada por bolsa de doutorado da FAPESP (processo 2025/04329-4).

Meu trabalho trata do **problema inverso tridimensional em Tomografia por
Impedância Elétrica** (TIE). A TIE recupera a distribuição interna de
condutividade $$\sigma$$ de um corpo a partir de tensões medidas no contorno,
induzidas por correntes injetadas. O mapa direto é governado pelo problema
elíptico

$$
\nabla \cdot (\sigma \nabla u) = 0 \quad \text{em } \Omega,
$$

com o modelo completo de eletrodos imposto em $$\partial\Omega$$. Seu inverso é
severamente mal-posto: pequenas perturbações nas tensões medidas correspondem a
grandes desvios na condutividade recuperada e, em três dimensões, o número de
incógnitas excede em muito o número de medidas independentes. A pergunta que
organiza meu trabalho é como fornecer a informação faltante na forma de um
*prior aprendido* sobre campos de condutividade anatomicamente plausíveis, em
vez de uma penalização genérica de suavidade.

Abordo isso por meio de representações neurais implícitas, modelos generativos
(difusão, fluxos normalizadores, flow matching) e modelos estatísticos de forma
construídos a partir de tomografias computadorizadas segmentadas. Uma descrição
de cada linha, com resultados, está na página de
[pesquisa]({{ '/pt/research/' | relative_url }}).

Paralelamente ao doutorado, atuo como desenvolvedor de software, construindo
sistemas de agentes de IA — geração aumentada por recuperação, orquestração de
agentes e o Model Context Protocol —, de onde também vem boa parte da prática de
engenharia por trás do pipeline de pesquisa.
