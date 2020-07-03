<template>
  <section class="tap-detail-financing">
    <div class="tap-detail-title-financing">融资信息</div>
    <div class="tap-detail-container-financing">
      <div class="row">
        <div class="col-6">
          <div class="cf-inline cf-inline--wide pad-h-20">
            <div class="cf-inline-label">融资供应商</div>
            <div class="cf-inline-content">{{info.supplierName}}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="cf-inline cf-inline--wide pad-h-20">
            <div class="cf-inline-label">申请融资金额</div>
            <div class="cf-inline-content">{{info.applyAmount | currency("¥")}}</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="cf-inline cf-inline--wide pad-h-20">
            <div class="cf-inline-label">融资期限</div>
            <div class="cf-inline-content">{{info.period}}天</div>
          </div>
        </div>
        <div class="col-6">
          <div class="cf-inline cf-inline--wide pad-h-20">
            <div class="cf-inline-label">融资利率</div>
            <div class="cf-inline-content">{{info.rate | percentage}}</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="cf-inline cf-inline--wide pad-h-20">
            <div class="cf-inline-label">申请日期</div>
            <div class="cf-inline-content">{{info.applyDate | formatDate}}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="cf-inline cf-inline--wide pad-h-20">
            <div class="cf-inline-label">预计到账</div>
            <div class="cf-inline-content">{{info.loanAmount | currency("¥")}}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CfFinancingInfo',
  props: {
    info: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
@import '~@/style/helper/vars';

.tap-detail-financing {
  .tap-detail-title-financing {
    font-size: 16px;
    color: #000;
    text-align: left;
    padding: 0 0 10px 80px;
  }
  .tap-detail-container-financing {
    padding-left: 50px;
    padding-right: 50px;
    padding-bottom: 30px;

    .cf-inline-label {
      min-width: 130px;
    }
  }
}
</style>
