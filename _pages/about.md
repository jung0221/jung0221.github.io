---
layout: about
title: about
permalink: /
subtitle: >
  PhD candidate, <a href="https://www.poli.usp.br/">Escola Politécnica</a>,
  <a href="https://www5.usp.br/">University of São Paulo</a> ·
  Department of Mechatronics and Mechanical Systems Engineering

profile:
  align: right
  # TODO: replace with a real photograph. Drop the file in assets/img/ and put
  # its filename here. Until then the theme's placeholder is used.
  image: prof_pic.jpg
  image_circular: false # crops the image to make it circular
  more_info: >
    <p>Escola Politécnica, USP</p>
    <p>Av. Prof. Mello Moraes, 2231</p>
    <p>São Paulo, SP 05508-030, Brazil</p>

selected_papers: true # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page

announcements:
  enabled: false # no news items yet; add files to _news/ and flip this to true
  scrollable: true
  limit: 5

latest_posts:
  enabled: false # blog is disabled
  scrollable: true
  limit: 3
---

I am a direct-entry doctoral candidate at the Escola Politécnica of the University
of São Paulo, in the Department of Mechatronics and Mechanical Systems
Engineering, advised by
[Prof. Marcos de Sales Guerra Tsuzuki](https://www.poli.usp.br/). My work is
funded by a FAPESP doctoral fellowship (grant 2025/04329-4).

My research concerns the **three-dimensional inverse problem in Electrical
Impedance Tomography** (EIT). EIT recovers the internal conductivity distribution
$$\sigma$$ of a body from boundary voltages induced by injected currents. The
forward map is governed by the elliptic problem

$$
\nabla \cdot (\sigma \nabla u) = 0 \quad \text{in } \Omega,
$$

with the complete electrode model imposed on $$\partial\Omega$$. Its inverse is
severely ill-posed: small perturbations of the measured voltages correspond to
large deviations in the recovered conductivity, and in three dimensions the
number of unknowns far exceeds the number of independent measurements. The
question that organises my work is how to supply the missing information as a
*learned prior* over anatomically plausible conductivity fields, rather than as a
generic smoothness penalty.

I approach this through implicit neural representations, generative models
(diffusion, normalizing flows, flow matching) and statistical shape models built
from segmented computed tomography. A description of the individual threads,
with results, is on the [research]({{ '/research/' | relative_url }}) page.

Alongside the doctorate I work as a software developer, building AI agent
systems — retrieval-augmented generation, agent orchestration and the Model
Context Protocol — which is also where much of the engineering practice behind
the research pipeline comes from.
