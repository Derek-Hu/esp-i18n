<template>
  <!-- 
    this 是 Comment注释
    应该忽略
  -->
  <section class="guide-wrap-section">
    <p>{{Labels.shiftToAnEarlierDatePrepareAsFollowsSoThat}}</p>
    <span :title="Labels.invoicePhoto"></span>
    <div :placeholder="Labels.businessContractNumberPleaseEnter" />
    <div :placeholder="Labels.businessContractNumberPleaseEnter" />
    <div :placeholder = "Labels.businessContractNumberPleaseEnter" />
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
    <p>{{Labels.borrowOrLendMoneyRisksInvestPrudent}}</p>
    <p>{{Labels.borrowOrLendMoneyRisksInvestPrudent1}}</p>
    <p>{{Labels.borrowOrLendMoneyRiskInvestThere}}{{{Labels.need}}}{{Labels.caution}}</p>
    <p>{{Labels.borrowOrLendMoneyRisksInvestPrudent2}}</p>
    <p>{{Labels.borrowOrLendMoneyRiskInvestPrudent}}</p>
    <p>{{Labels.borrowOrLendMoneyRiskInvestPrudent1}}</p>
    <p>{{Labels.earth2018Huanyu}}<span class="splitter">|</span>{{Labels['80030781']}}<span class="splitter">|</span>{{Labels.aMajorCityInLiaoningCorporationDalianPrivate}}</p>
  </section>
</template>

<script>
import { formatMessage } from '~/locale-tools';

export default {
  async mounted() {},
  data() {
return {
 Labels: {
  "80030781": formatMessage({id: '8003078---1'}),
  "shiftToAnEarlierDatePrepareAsFollowsSoThat": formatMessage({id: 'shift-to-an-earlier-date-prepare-as-follows-so-that'}),
  "invoicePhoto": formatMessage({id: 'invoice-photo'}),
  "businessContractNumberPleaseEnter": formatMessage({id: 'business-contract-number-please-enter'}),
  "interesting": formatMessage({id: 'interesting'}),
  "heheHehe2": formatMessage({id: 'hehe-hehe-2'}),
  "sameContent": formatMessage({id: 'same-content'}),
  "thisIsAString": formatMessage({id: 'this-is-a-string'}),
  "wordStringButContentIts": formatMessage({id: 'word-string-but-content-its'}),
  "wordStringThisIsThe": formatMessage({id: 'word-string-this-is-the'}),
  "wordStringButRateOfProgressContent": formatMessage({id: 'word-string-but-rate-of-progress-content'}),
  "borrowOrLendMoneyRisksInvestPrudent": formatMessage({id: 'borrow-or-lend-money-risks-invest-prudent'}),
  "borrowOrLendMoneyRisksInvestPrudent1": formatMessage({id: 'borrow-or-lend-money-risks-invest-prudent-1'}),
  "borrowOrLendMoneyRiskInvestThere": formatMessage({id: 'borrow-or-lend-money-risk-invest-there'}),
  "need": formatMessage({id: 'need'}),
  "caution": formatMessage({id: 'caution'}),
  "borrowOrLendMoneyRisksInvestPrudent2": formatMessage({id: 'borrow-or-lend-money-risks-invest-prudent-2'}),
  "borrowOrLendMoneyRiskInvestPrudent": formatMessage({id: 'borrow-or-lend-money-risk-invest-prudent'}),
  "borrowOrLendMoneyRiskInvestPrudent1": formatMessage({id: 'borrow-or-lend-money-risk-invest-prudent-1'}),
  "earth2018Huanyu": formatMessage({id: 'earth-2018-huanyu'}),
  "aMajorCityInLiaoningCorporationDalianPrivate": formatMessage({id: 'a-major-city-in-liaoning-corporation-dalian-private'})
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
