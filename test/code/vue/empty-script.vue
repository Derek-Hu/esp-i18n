<template>
  <!-- 
    this 是 Comment注释
    应该忽略
  -->
  <section class="guide-wrap-section">
    <p>建议提前准备如下资料，以便快速完成填写</p>
    <span :title="'发票照片'"></span>
    <div placeholder="请输入贸易合同编号" />
    <span :title="'发票照片'"></span>
    <div :placeholder=" isTrue ? '请输入贸易合同编号': '呵呵呵'"></div>
  </section>
</template>