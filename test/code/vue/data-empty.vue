<template>
  <!-- 
    this 是 Comment注释
    应该忽略
  -->
  <section class="guide-wrap-section">
    <p>建议提前准备如下资料，以便快速完成填写</p>
    <span :title="'发票照片'"></span>
    <p>  请输入  贸易合同编号   </p>
    <div :placeholder=" isTrue ? '  请输入贸易合同编号': '呵呵呵  '"></div>
    <div placeholder ="  请输入贸易合同编号" />
    <div placeholder="请输入贸易合同编号" />
    <div placeholder='请输入贸易合同编号' />
    <div placeholder = "请输入贸易合同编号" />
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
    <p>借贷有风险，投资?需谨慎</p>
    <p>借贷\有风险，*投资*需谨慎(元)</p>
    <p>借贷有.风险[投资{需}谨慎]</p>
    <p>(借贷有风险\100投资需谨慎)</p>
    <p>借贷/风险(投资)需谨慎</p>
    <p>借贷/风险=3(投资)需谨慎</p>
    <p>©2018 环宇信链 辽ICP备<span class="splitter">|</span>8003078号-1<span class="splitter">|</span>大连市民间借贷服务有限公司</p>
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
