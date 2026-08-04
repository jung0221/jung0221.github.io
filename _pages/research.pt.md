---
layout: page
permalink: /pt/research/
title: pesquisa
description: Aprendizado profundo para o problema inverso tridimensional em Tomografia por Impedância Elétrica.
lang: pt
ref: research
nav: true
nav_order: 2
toc:
  sidebar: left
---

## O problema

A Tomografia por Impedância Elétrica é uma modalidade de imagem não invasiva e
livre de radiação. Correntes de baixa amplitude são injetadas por eletrodos na
superfície do corpo e as tensões resultantes no contorno são medidas; a partir
dessas medidas, busca-se recuperar a distribuição interna de condutividade
$$\sigma(\mathbf{x})$$. Como a condutividade varia fortemente entre pulmão
aerado, sangue e tecido mole, e como a medição é rápida e barata, a TIE é
atraente para o monitoramento de ventilação e perfusão à beira do leito.

O problema direto é o problema de valor de contorno elíptico

$$
\nabla \cdot \big( \sigma(\mathbf{x}) \, \nabla u(\mathbf{x}) \big) = 0,
\qquad \mathbf{x} \in \Omega ,
$$

fechado pelo modelo completo de eletrodos, que leva em conta a impedância de
contato e o efeito de curto-circuito dos eletrodos:

$$
u + z_\ell \, \sigma \frac{\partial u}{\partial n} = U_\ell \ \text{ em } E_\ell,
\qquad
\int_{E_\ell} \sigma \frac{\partial u}{\partial n} \, \mathrm{d}S = I_\ell .
$$

O problema inverso — recuperar $$\sigma$$ a partir dos pares
$$(I_\ell, U_\ell)$$ — é severamente mal-posto. Em três dimensões a situação é
pior do que no caso bidimensional usualmente estudado: o número de incógnitas
cresce com o volume da malha, enquanto o número de medidas independentes cresce
apenas com o número de eletrodos, de modo que o espaço nulo do operador
linearizado é grande. A regularização clássica do tipo Tikhonov resolve isso
preferindo soluções suaves, o que é exatamente o prior errado para uma anatomia
formada por órgãos homogêneos por partes com fronteiras nítidas.

{% include figure.liquid
   path="assets/img/research/fig_dominio_EIT.png"
   class="img-fluid rounded z-depth-1"
   caption="O domínio da TIE: correntes injetadas nos eletrodos do contorno e tensões medidas nos demais."
%}

{% include figure.liquid
   path="assets/img/research/fig_current_pattern.png"
   class="img-fluid rounded z-depth-1"
   caption="Padrões de injeção de corrente aplicados ao arranjo de eletrodos."
%}

O fio condutor do meu trabalho é que a informação faltante deve ser fornecida
como um **prior aprendido sobre campos de condutividade anatomicamente
plausíveis**, e não como uma penalização genérica de suavidade.

---

## Representações neurais implícitas do campo de condutividade

Em vez de armazenar $$\sigma$$ como um valor por elemento da malha, uma rede
neural $$f_\theta : \mathbb{R}^3 \to \mathbb{R}$$ a representa como um campo
contínuo, avaliado em pontos arbitrários. Isso desacopla a representação da
malha e torna a resolução da reconstrução independente da resolução do modelo
direto.

Redes ReLU convencionais são enviesadas para baixas frequências e suavizam
demais justamente as fronteiras dos órgãos, que carregam o conteúdo
diagnóstico. Ativações periódicas atacam esse problema diretamente. No trabalho
apresentado no IFAC 2026, estendi as representações senoidais da formulação
bidimensional baseada em malha para malhas tetraédricas tridimensionais
completas, e comparei ativações senoidais padrão com a variante
seno-hiperbólica (H-SIREN).

{% include figure.liquid
   path="assets/img/research/fig_neural_network.svg"
   class="img-fluid rounded z-depth-1"
   caption="Arquitetura codificador–decodificador com ativações periódicas, mapeando tensões de contorno em um campo volumétrico de condutividade."
%}

O modelo seno-hiperbólico recupera fronteiras mais nítidas e contrastes de
condutividade mais precisos do que o senoidal padrão, e degrada de forma mais
suave à medida que o ruído de medição aumenta.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_model_comparation.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Reconstruções dos modelos seno e seno-hiperbólico comparadas à referência.
</div>

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_cylinder_noise.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Comportamento sob ruído de medição crescente em phantoms cilíndricos 3D.
</div>

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_cond_point_cloud.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Condutividade volumétrica recuperada, como nuvem de pontos sobre a malha tetraédrica.
</div>

Uma linha relacionada, apresentada no EMBC 2025, trata a reconstrução como a
solução de uma restrição implícita de ponto fixo, em vez de uma passagem direta
explícita, combinando iteração de ponto fixo com o método de Newton. Nela, a
condutividade de contato é modelada como variável aleatória, e não como
constante fixa, de modo que a rede é treinada contra a incerteza que de fato
enfrentará.

<!-- TODO: incluir as figuras de reconstrução do artigo de camadas implícitas do
     EMBC 2025 quando você decidir quais publicar aqui. (Mesmo TODO da versão em
     inglês — mantenha as duas páginas em sincronia.) -->

---

## Priors anatômicos a partir de modelos estatísticos de forma

Um prior sobre campos de condutividade é, em boa medida, um prior sobre
anatomia. Construo modelos estatísticos de forma multiestrutura do tórax a
partir de um corpus de tomografias segmentadas, colocando várias estruturas
corregistradas — superfície do corpo, pulmões, coração, traqueia, aorta, canal
medular — em um *único* espaço de formas, de modo que as correlações entre elas
(tamanho do tronco em relação ao tamanho dos órgãos, por exemplo) sobrevivam nas
amostras geradas pelo modelo.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_organs.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Estruturas torácicas corregistradas que entram no modelo conjunto de forma.
</div>

<div class="row">
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_skin.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_pulmao.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Superfície do corpo e estruturas pulmonares extraídas do corpus de tomografias.
</div>

<div class="row">
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_ribs.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
  <div class="col-sm-6 mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_trachea_lungs_a.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Estruturas ósseas e a traqueia em relação aos pulmões.
</div>

Um espaço de formas único e compartilhado precisa gastar sua capacidade tanto em
*posicionar* cada estrutura quanto em descrevê-la, o que limita o quão bem
estruturas pequenas e finas podem ser representadas — e as estruturas mais finas
são justamente aquelas cuja posição mais importa para o campo de condutividade.
Investigo atualmente uma formulação hierárquica que separa a forma de cada
estrutura de sua pose, o que aparentemente elimina esse acoplamento. Resultados
quantitativos estão em preparação para publicação.

---

## Segmentação: obter a anatomia em primeiro lugar

Nada do que foi descrito acima funciona sem um fornecimento confiável de
tomografias torácicas segmentadas. Meu trabalho anterior desenvolveu o
**LUNAS** (LUNg Automatic Seeding and Segmentation), um método automático
baseado em sementes construído sobre a Relaxed Oriented Image Foresting
Transform. Ele atinge coeficiente Dice de 0,96 e 0,97 para os pulmões esquerdo e
direito no Lung CT Segmentation Challenge — equiparando-se às melhores
submissões de aprendizado profundo — enquanto permanece um método combinatório
baseado em sementes, e se estende à traqueia, aos ossos e à pele.

{% include figure.liquid
   path="assets/img/research/fig_seed_generation.png"
   class="img-fluid rounded z-depth-1"
   caption="Geração automática de sementes, a etapa que elimina a entrada manual que o ROIFT exigiria."
%}

Este trabalho está publicado no *Biomedical Signal Processing and Control* e o
código está [disponível no GitHub](https://github.com/jung0221/LUNAS).

---

## Interesses de pesquisa

- Problemas inversos e sua regularização
- Modelos generativos: difusão, fluxos normalizadores, flow matching
- Representações neurais implícitas
- Modelos estatísticos de forma
- Análise e segmentação de imagens médicas
