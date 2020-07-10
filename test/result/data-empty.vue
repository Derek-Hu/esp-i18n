<template>
  <!-- 
    this 是 Comment注释
    应该忽略
  -->
  <section class="guide-wrap-section">
    <p>{{Labels.shiftToAnEarlierDatePrepareAsFollowsSoThat}}</p>
    <span :title="Labels.invoicePhoto"></span>
    <div :placeholder="Labels.businessContractNumberPleaseEnter" />
    <span :title="Labels.invoicePhoto"></span>
    <div :placeholder=" isTrue ? Labels.businessContractNumberPleaseEnter: Labels.interesting"></div>
    <div :placeholder=" isTrue ? Labels.heheHehe2: Labels.interesting"></div>
    <div :placeholder='isTrue ? Labels.heheHehe2: Labels.interesting'></div>
    <div :placeholder='isTrue ? Labels.heheHehe2: Labels.interesting'></div>
    <div :placeholder='isTrue ? Labels.sameContent: Labels.sameContent'></div>
    <div :placeholder="isTrue ? Labels.sameContent: Labels.sameContent"></div>
    <p>{{Labels.sameContent}}<br/>{{Labels.shiftToAnEarlierDatePrepareAsFollowsSoThat}}<span>{{Labels.sameContent}}</span></p>
    <p>{{Labels.thisIsAString}}<br/>{{Labels.wordStringButContentIts}}<span>{{Labels.thisIsAString}}</span></p>
    <p>{{Labels.wordStringThisIsThe}}<br/>{{Labels.wordStringButRateOfProgressContent}}<span>{{Labels.thisIsAString}}</span></p>
  </section>
</template>

<script>
import { formatMessage } from '~/locale-tools';

export default {
  async mounted() {},
  data() {
return {
 Labels: {
  "shiftToAnEarlierDatePrepareAsFollowsSoThat": formatMessage({id: 'shift-to-an-earlier-date-prepare-as-follows-so-that'}),
  "invoicePhoto": formatMessage({id: 'invoice-photo'}),
  "businessContractNumberPleaseEnter": formatMessage({id: 'business-contract-number-please-enter'}),
  "interesting": formatMessage({id: 'interesting'}),
  "heheHehe2": formatMessage({id: 'hehe-hehe-2'}),
  "sameContent": formatMessage({id: 'same-content'}),
  "thisIsAString": formatMessage({id: 'this-is-a-string'}),
  "wordStringButContentIts": formatMessage({id: 'word-string-but-content-its'}),
  "wordStringThisIsThe": formatMessage({id: 'word-string-this-is-the'}),
  "wordStringButRateOfProgressContent": formatMessage({id: 'word-string-but-rate-of-progress-content'})
}
}
},
  methods: {
    goToSupplierEnter() {
      this.$router.push({
        name: 'companyEnter'
      });
    }
  }
};
</script>
