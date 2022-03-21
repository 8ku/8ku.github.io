---
layout: post
title: A gift for someone I meet-3D Design
categories: [3D-Art]
image: assets/images/3DArt/3D_WorkingPerson_Rendering.jpg
featured: false
lang: zh
---

<style>
		#box {
			text-align: center;
			width: 100%;
		}
		#c {
			float: center;
			width: 100%;
			height: 540px;
		}
</style>


这是一个突发奇想的项目。

很早以前开始，我从一个朋友那学来一个习惯：给旅途中遇到的人送礼物。有时是自己的摄影，有时是买到的好玩的东西。这一次是尝试把一个人做成独一无二的手办。就是说，我把一个旅途上遇到的人做成手办送给她本人。

提取一个人的特征建模对我来说不是困难的事，困难的是我从来没有做过的把模型拆分、打印、拼装和上色。

<div class="row" style="margin-bottom:16px;">
<div class="col-sm-6">
<img src="/assets/images/3DArt/3D_WorkingPerson_modeling.jpg">
</div>
<div class="col-sm-6">
<img src="/assets/images/3DArt/3D_WorkingPerson_modeling2.jpg">
</div>
</div>



![Rendering]({{site.baseurl}}/assets/images/3DArt/3D_WorkingPerson_Rendering.jpg)

为了增加可玩性，这个礼物还包含了一个可以直接在手机上观看的AR模型，在寻找更便捷的实现方式时，无意中发现了 **Three.js** 这个脚本语言。虽然最终还是决定使用苹果官方的 Reality Converter 把模型转换为可以直接在苹果手机上打开的AR模型，但我也顺手学了如何在 Web 网站上显示可交互的 3D 模型的方法。这个意外的插曲也让我成功为公司的虚拟人项目做了一点点贡献。

<div id="box">
		<canvas id="c"></canvas>
  	<p>
     这是一个可以用鼠标放大缩小的模型～
  </p>
</div>



<div class="row" style="margin-bottom:16px;">
<div class="col-sm-6">
<img src="/assets/images/3DArt/3D_WorkingPerson_3DPrinting1.jpg">
</div>
<div class="col-sm-6">
<img src="/assets/images/3DArt/3D_WorkingPerson_3DPrinting2.jpg">
</div>
</div>
![painting]({{site.baseurl}}/assets/images/3DArt/3D_WorkingPerson_painting.jpg)



要说我在这次经历里收获了什么，我想最大的收获是如何一步步实现自己的想法。虽然中途比较坎坷，整个项目从 “我有一个想法” 到最终实现经历了快1个半月，但它完成了，我也在过程中收获很多快乐和成就感。

当然，这仅仅是一个开始。



<script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>


<script type="importmap">{
			"imports": {
				"three": "https://threejs.org/build/three.module.js"
			}
		}</script>
<script type="module" src="{{ site.baseurl }}/assets/js/js3d/threejsCanvas.js"></script>

