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
    <div :placeholder=" isTrue ? '呵呵呵2': '呵呵呵'"></div>
    <div :placeholder='isTrue ? "呵呵呵2": "呵呵呵"'></div>
    <div :placeholder='isTrue ? `呵呵呵2`: `呵呵呵`'></div>
    <div :placeholder='isTrue ? "相同内容": `相同内容`'></div>
    <div :placeholder="isTrue ? '相同内容': `相同内容`"></div>
    <p>相同内容<br/>建议提前准备如下资料，以便快速完成填写<span>相同内容</span></p>
    <p>这是字串<br/>这是字串，但是内容很长<span>这是字串</span></p>
    <p>这是0.30字串<br/>这是字串，但是3/10进度内容很长<span>这是字串</span></p>
  </section>
</template>

<script>
export default {
  async mounted() {},
  data() {},
  methods: {
    goToSupplierEnter() {
      this.$router.push({
        name: 'companyEnter'
      });
    }
  }
};
</script>
