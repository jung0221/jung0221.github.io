---
layout: page
permalink: /research/
title: research
description: Deep learning for the three-dimensional inverse problem in Electrical Impedance Tomography.
lang: en
ref: research
nav: true
nav_order: 2
toc:
  sidebar: left
---

## The problem

Electrical Impedance Tomography is a non-invasive, radiation-free imaging
modality. Low-amplitude currents are injected through electrodes on the surface
of the body and the resulting boundary voltages are measured; from those
measurements one attempts to recover the internal conductivity distribution
$$\sigma(\mathbf{x})$$. Because conductivity varies strongly between aerated
lung, blood and soft tissue, and because the measurement is fast and cheap, EIT
is attractive for bedside monitoring of ventilation and perfusion.

The forward problem is the elliptic boundary value problem

$$
\nabla \cdot \big( \sigma(\mathbf{x}) \, \nabla u(\mathbf{x}) \big) = 0,
\qquad \mathbf{x} \in \Omega ,
$$

closed by the complete electrode model, which accounts for contact impedance and
the shunting effect of the electrodes:

$$
u + z_\ell \, \sigma \frac{\partial u}{\partial n} = U_\ell \ \text{ on } E_\ell,
\qquad
\int_{E_\ell} \sigma \frac{\partial u}{\partial n} \, \mathrm{d}S = I_\ell .
$$

The inverse problem — recovering $$\sigma$$ from the pairs
$$(I_\ell, U_\ell)$$ — is severely ill-posed. In three dimensions the situation
is worse than in the two-dimensional case usually studied: the number of
unknowns grows with the volume of the mesh while the number of independent
measurements grows only with the number of electrodes, so the null space of the
linearised operator is large. Classical Tikhonov-type regularisation resolves
this by preferring smooth solutions, which is exactly the wrong prior for an
anatomy made of piecewise-homogeneous organs with sharp boundaries.

{% include figure.liquid
   path="assets/img/research/fig_dominio_EIT.png"
   class="img-fluid rounded z-depth-1"
   caption="The EIT domain: currents injected at boundary electrodes, voltages measured at the remaining ones."
%}

{% include figure.liquid
   path="assets/img/research/fig_current_pattern.png"
   class="img-fluid rounded z-depth-1"
   caption="Current injection patterns applied to the electrode array."
%}

The thread running through my work is that the missing information should be
supplied as a **learned prior over anatomically plausible conductivity fields**,
not as a generic smoothness penalty.

---

## Implicit neural representations of the conductivity field

Instead of storing $$\sigma$$ as one value per mesh element, a neural network
$$f_\theta : \mathbb{R}^3 \to \mathbb{R}$$ represents it as a continuous field
evaluated at arbitrary points. This decouples the representation from the mesh
and makes the resolution of the reconstruction independent of the resolution of
the forward model.

Conventional ReLU networks are biased towards low frequencies and oversmooth
exactly the organ boundaries that carry the diagnostic content. Periodic
activations address this directly. In work presented at IFAC 2026 I extended
sinusoidal representations from the two-dimensional, mesh-based formulation to
full three-dimensional tetrahedral meshes, and compared standard sinusoidal
activations against the hyperbolic-sinusoidal (H-SIREN) variant.

{% include figure.liquid
   path="assets/img/research/fig_neural_network.svg"
   class="img-fluid rounded z-depth-1"
   caption="Encoder–decoder architecture with periodic activations mapping boundary voltages to a volumetric conductivity field."
%}

The hyperbolic-sinusoidal model gives sharper boundary recovery and more
accurate conductivity contrast than the standard sinusoidal one, and degrades
more gracefully as measurement noise increases.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_model_comparation.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Reconstructions from the sine and hyperbolic-sine models against ground truth.
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
  Behaviour under increasing measurement noise on 3D cylindrical phantoms.
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
  Recovered volumetric conductivity as a point cloud over the tetrahedral mesh.
</div>

A related line, presented at EMBC 2025, treats the reconstruction as the
solution of an implicit fixed-point constraint rather than an explicit forward
pass, combining fixed-point iteration with Newton's method. There, contact
conductivity is modelled as a random variable rather than a fixed constant, so
that the network is trained against the uncertainty it will actually face.

<!-- TODO: add the reconstruction figures from the EMBC 2025 implicit-layers
     paper once you decide which ones to publish here. -->

---

## Anatomical priors from statistical shape models

A prior over conductivity fields is, to a large extent, a prior over anatomy.
I build multi-structure statistical shape models of the thorax from a corpus of
segmented CT scans, placing several co-registered structures — body surface,
lungs, heart, trachea, aorta, spinal canal — in a *single* shape space, so that
correlations between them (torso size against organ size, for instance) survive
into the samples drawn from the model.

<div class="row">
  <div class="col-sm mt-3 mt-md-0">
    {% include figure.liquid
       path="assets/img/research/fig_organs.png"
       class="img-fluid rounded z-depth-1"
    %}
  </div>
</div>
<div class="caption">
  Co-registered thoracic structures entering the joint shape model.
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
  Body surface and lung structures extracted from the CT corpus.
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
  Skeletal structures, and the trachea in relation to the lungs.
</div>

A single shared shape space has to spend its capacity on *placing* each
structure as well as describing it, which caps how well small, thin structures
can be represented — and the thinnest structures are the ones whose position
matters most for the conductivity field. I am currently investigating a
hierarchical formulation that separates per-structure shape from per-structure
pose, which appears to remove that coupling. Quantitative results are being
prepared for publication.

---

## Segmentation: getting the anatomy in the first place

None of the above works without a reliable supply of segmented thoracic CT.
My earlier work developed **LUNAS** (LUNg Automatic Seeding and Segmentation),
an automatic seed-based method built on the Relaxed Oriented Image Foresting
Transform. It reaches a Dice coefficient of 0.96 and 0.97 for the left and right
lungs on the Lung CT Segmentation Challenge — matching the best deep learning
entries — while remaining a seed-based combinatorial method, and it extends to
the trachea, bones and skin.

{% include figure.liquid
   path="assets/img/research/fig_seed_generation.png"
   class="img-fluid rounded z-depth-1"
   caption="Automatic seed generation, the step that removes the manual input ROIFT would otherwise require."
%}

This work is published in *Biomedical Signal Processing and Control* and the
code is [available on GitHub](https://github.com/jung0221/LUNAS).

---

## Research interests

- Inverse problems and their regularisation
- Generative models: diffusion, normalizing flows, flow matching
- Implicit neural representations
- Statistical shape models
- Medical image analysis and segmentation
