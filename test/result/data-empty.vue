<template>
  <!-- 
    this 是 Comment注释
    应该忽略
  -->
  <section class="guide-wrap-section">
    <p>{{Labels.shifttoanearlierdatePrepareAsfollowsSothat}}</p>
    <span :title="Labels.invoicePhoto"></span>
    <p>  {{Labels.businessContractNumberPleaseEnter1}}   </p>
    <div :placeholder=" isTrue ? Labels.businesscontractNumberPleaseEnter1: Labels.interesting1"></div>
    <div :placeholder ="Labels.businesscontractNumberPleaseEnter1" />
    <div :placeholder="Labels.businesscontractNumberPleaseEnter" />
    <div :placeholder="Labels.businesscontractNumberPleaseEnter" />
    <div :placeholder = "Labels.businesscontractNumberPleaseEnter" />
    <span :title="Labels.invoicePhoto"></span>
    <div :placeholder=" isTrue ? Labels.businesscontractNumberPleaseEnter: Labels.interesting"></div>
    <div :placeholder=" isTrue ? Labels.heheHehe2: Labels.interesting"></div>
    <div :placeholder='isTrue ? Labels.heheHehe2: Labels.interesting'></div>
    <div :placeholder='isTrue ? Labels.heheHehe2: Labels.interesting'></div>
    <div :placeholder='isTrue ? Labels.sameContent: Labels.sameContent'></div>
    <div :placeholder="isTrue ? Labels.sameContent: Labels.sameContent"></div>
    <p>{{Labels.sameContent}}<br/>{{Labels.shifttoanearlierdatePrepareAsfollowsSothat}}<span>{{Labels.sameContent}}</span></p>
    <p>{{Labels.thisIsAString}}<br/>{{Labels.wordstringButContentIts}}<span>{{Labels.thisIsAString}}</span></p>
    <p>{{Labels.wordstringThisIsThe}}<br/>{{Labels.wordstringButRateofprogressContent}}<span>{{Labels.thisIsAString}}</span></p>
    <p>{{Labels.borroworlendmoneyRisksInvestPrudent}}</p>
    <p>{{Labels.borroworlendmoneyRisksInvestPrudent1}}</p>
    <p>{{Labels.borroworlendmoneyRiskInvestThere}}{{{Labels.need}}}{{Labels.caution}}</p>
    <p>{{Labels.borroworlendmoneyRisksInvestPrudent2}}</p>
    <p>{{Labels.borroworlendmoneyRiskInvestPrudent}}</p>
    <p>{{Labels.borroworlendmoneyRiskInvestPrudent1}}</p>
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
  "80030781": formatMessage({id: '8003078-1'}),
  "shifttoanearlierdatePrepareAsfollowsSothat": formatMessage({id: 'shifttoanearlierdate-prepare-asfollows-sothat'}),
  "invoicePhoto": formatMessage({id: 'invoice-photo'}),
  "businessContractNumberPleaseEnter1": formatMessage({id: 'business-contract-number-please-enter-1'}),
  "businesscontractNumberPleaseEnter1": formatMessage({id: 'businesscontract-number-please-enter-1'}),
  "interesting1": formatMessage({id: 'interesting-1'}),
  "businesscontractNumberPleaseEnter": formatMessage({id: 'businesscontract-number-please-enter'}),
  "interesting": formatMessage({id: 'interesting'}),
  "heheHehe2": formatMessage({id: 'hehe-hehe-2'}),
  "sameContent": formatMessage({id: 'same-content'}),
  "thisIsAString": formatMessage({id: 'this-is-a-string'}),
  "wordstringButContentIts": formatMessage({id: 'wordstring-but-content-its'}),
  "wordstringThisIsThe": formatMessage({id: 'wordstring-this-is-the'}),
  "wordstringButRateofprogressContent": formatMessage({id: 'wordstring-but-rateofprogress-content'}),
  "borroworlendmoneyRisksInvestPrudent": formatMessage({id: 'borroworlendmoney-risks-invest-prudent'}),
  "borroworlendmoneyRisksInvestPrudent1": formatMessage({id: 'borroworlendmoney-risks-invest-prudent-1'}),
  "borroworlendmoneyRiskInvestThere": formatMessage({id: 'borroworlendmoney-risk-invest-there'}),
  "need": formatMessage({id: 'need'}),
  "caution": formatMessage({id: 'caution'}),
  "borroworlendmoneyRisksInvestPrudent2": formatMessage({id: 'borroworlendmoney-risks-invest-prudent-2'}),
  "borroworlendmoneyRiskInvestPrudent": formatMessage({id: 'borroworlendmoney-risk-invest-prudent'}),
  "borroworlendmoneyRiskInvestPrudent1": formatMessage({id: 'borroworlendmoney-risk-invest-prudent-1'}),
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
