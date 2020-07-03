<template>
  <cf-panel :title="breadcrumbData" >
    <div class="pad-10">
      <div class="nav-bar">
        <ul class="line">
          <li v-for="(item, index) in dotArr" :class="{dot:1, active: nowStep>index+1, curr: nowStep === index+1 }" ><span>{{index+1}}</span><span>{{item}}</span></li>
        </ul>
      </div>
      <div class="hr30"></div>
      <input type="hidden" name="" v-model="step0.companyId" >
      <!-- 企业基本信息 -->
      <div id="J_Company_Step0" :style="{display:nowStep==1?'block':'none'}" >
        <div class="row">
          <cf-upload
            ref="step0LicenceOssId"
            :id="'step0LicenceOssId'"
            :acceptType="'image'"
            :size="idCardSize"
            ::title=="Labels.businessLicense"
            :ocrUrl="'/matrix/ocr-recognition'"
            @ocrSuccess="ocrSuccessStep0LicenceOssId"
            @ossSuccess="(data)=>(this.step0.licenceOssId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>{{Labels.fullNameOfCompany}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.companyName" :placeholder=="Labels.uploadBusinessLicenseFetchFillIn" maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.unifiedSocialCreditCode}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.usci" :placeholder=="Labels.uploadBusinessLicenseFetchFillIn" maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.companyPhone}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.companyTel" :placeholder=="Labels.fillInTelephonePleaseFill" maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.companyAddress}}</label>
          <div class="province-city" id="address" v-bind:data-province="step0.companyAddressProvince" v-bind:data-city="step0.companyAddressCity"></div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <div class="" style="padding-top:14px;" >
            <input type="text" v-model.trim="step0.companyAddress" :placeholder=="Labels.companyAddress" maxlength="50" class="cf-input cf-input--long" id="" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.nameOfLegalRepresentative}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.legalPersonName" :placeholder=="Labels.uploadBusinessLicenseFetchFillIn"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.dateOfEstablishment}}</label>
          <div>
            <cf-datepicker :width="'53%'" @pick="pickFoundDate" :value="foundDate" ></cf-datepicker>
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.businessDueDate}}</label>
          <div>
            <label for="r1" ><input type="radio" @change="changePeriod" name="business" id="r1" value="长期" :checked="is_long_period" >长期</label>
            <label for="r2" ><input type="radio" @change="changePeriod" name="business" id="r2" value="非长期" :checked="!is_long_period" >非长期</label>
            <div v-show="!is_long_period" >
              <div>
                <cf-datepicker :width="'53%'"  @pick="pickDueDate" :value="dueDate" ></cf-datepicker>
              </div>
              <div class="err">{{errMsg}}</div>
            </div>
          </div>
        </div>
        <div class="row">
          <a target="_blank" href="/api/company/template?template=CREDIT_AUTHORIZATION" class="report-alink" >{{Labels.template}}</a>
          <cf-upload
            ref="step0companyCreditAuthorizationId"
            :id="'step0companyCreditAuthorizationId'"
            :acceptType="['image', 'pdf']"
            ::title=="Labels.financialStatementOfIncomeAndExpenditureOfAFoundationEtcLetterOfAuthorizationLetterOf"
            @ossSuccess="(data)=>(this.step0.companyCreditAuthorizationId = data.key)"
          ></cf-upload>
          <cf-upload
            ref="step0companyCreditReportId"
            :id="'step0companyCreditReportId'"
            :acceptType="['image', 'pdf']"
            ::title=="Labels.enterpriseCreditReportOptional"
            @ossSuccess="(data)=>(this.step0.companyCreditReportId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <button type="button"  class="cf-button cf-button--primary next-btn" @click.prevent="check_step0" >{{Labels.nextStep}}</button>
        </div>
      </div>
      <!-- 银行账户信息 -->
      <div id="J_Company_Step1"  :style="{display:nowStep==2?'block':'none'}"  >
        <div>
          <label>{{Labels.nameOfEnterprise}}</label>
          <div>{{step0.companyName}}</div>
        </div>
        <div class="row">
          <label>{{Labels.bankAccount}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step1.bankAccount" :placeholder=="Labels.importBankAccountPleaseInput"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.bank}}</label>
          <div class="cf-input--long">
            <cf-dropdown
              ::placeholder=="Labels.pleaseSelectYourBank"
              :data="allBanks"
              :width="'100%'"
              @change="changeBank"
              >
            </cf-dropdown>
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.openAnAccountProvinceAndCity}}</label>
          <div class="province-city" id="addressBank" v-bind:data-province="step1.branchBankProvince" v-bind:data-city="step1.branchBankCity"></div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.accountOpeningBranch}}</label>
          <div>
            <input type="text" v-model.trim="step1.branchBankName" :placeholder=="Labels.subbranchNamePleaseEnter" class="cf-input cf-input--long" id=""  maxlength="50">
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <div>
            <a class="cf-button  prev-btn" @click.prevent="prev_step" ref="step2" target="_blank">{{Labels.returnBackToThe}}</a>
            <a class="cf-button cf-button--primary next-btn" @click.prevent="check_step1" target="_blank">{{Labels.nextStep}}</a>
          </div>
        </div>
      </div>
      <!-- 法定代表人信息 -->
      <div id="J_Company_Step2" :style="{display:nowStep==3?'block':'none'}" >
         <div class="">
          <label>{{Labels.nameOfLegalRepresentative}}</label>
          <div class="" style="font-size:16px;font-weight:bold;" >
            {{step0.legalPersonName}}
          </div>
        </div>
        <div class="">
          <h3>{{Labels.documentType}}</h3>
          <div class="cf-input--long">
            <cf-dropdown
              ::placeholder=="Labels.pleaseSelectACertificate"
              :data="allIDtypes"
              :width="'100%'"
              @change="changeIDtype"
              >
            </cf-dropdown>
          </div>
        </div>
        <div class="row" style="padding-top:16px;">
          <div style="position:absolute;margin-top:-9px;" >{{Labels.certificateOfLegalRepresentative}}</div>
          <cf-upload v-if="step2.legalPersonIdType=='ID_CARD'"
            ref="step2LicenceOssId1"
            id="step2LicenceOssId1"
            acceptType="image"
            :size="idCardSize"
            title=""
            :inTitle=="Labels.frontOfCertificate"
            ocrUrl="/matrix/idcard-recognition"
            :resetFlag="licenceOssIdResetFlag"
            @ocrSuccess="ocrSuccessStep2LicenceOssId1"
            @ossSuccess="(data)=>(this.step2.legalPersonFrontOssId = data.key)"
          ></cf-upload>
          <cf-upload v-if="step2.legalPersonIdType!='ID_CARD'"
            ref="step2LicenceOssId1"
            id="step2LicenceOssId1"
            acceptType="image"
            title=""
            :inTitle=="Labels.frontOfCertificate"
            :resetFlag="licenceOssIdResetFlag"
            @ossSuccess="(data)=>(this.step2.legalPersonFrontOssId = data.key)"
          ></cf-upload>
          <span id="J_Passport" >
            <cf-upload
              ref="step2LicenceOssId2"
              :id="'step2LicenceOssId2'"
              :acceptType="'image'"
              :size="idCardSize"
              :title="''"
              ::inTitle=="Labels.backOfCertificate"
              :resetFlag="licenceOssIdResetFlag"
              @ossSuccess="(data)=>(this.step2.legalPersonBackOssId = data.key)"
            ></cf-upload>
          </span>
        </div>
        <div class="row">
          <label>{{Labels.legalRepresentativeCredentialsCertificateNumber}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step2.legalPersonId" :placeholder=="Labels.uploadCredentialsFetchFillIn"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.legalRepresentativePostboxEmailAddress}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step2.legalPersonEmail" :placeholder=="Labels.importLegalRepresentativePostboxPlease"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.legalRepresentativeMobileNumberMobilePhone}}</label>
          <div>
            <input type="number" v-integer class="cf-input cf-input--long" v-model.trim="step2.legalPersonPhone" :placeholder=="Labels.importLegalRepresentativeMobileNumberPlease"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <cf-upload
            ref="step2LicenceOssId3"
            :id="'step2LicenceOssId3'"
            :acceptType="'pdf'"
            ::title=="Labels.legalRepresentativeIndividualFinancialStatementOfIncomeAndExpenditureOfAFoundationEtcReport"
            ::inTitle=="Labels.legalRepresentativeFinancialStatementOfIncomeAndExpenditureOfAFoundationEtcReportPersonal"
            @ossSuccess="(data)=>(this.step2.legalPersonCreditReportOssId = data.key)"
          ></cf-upload>
        </div>
        <div class="row" v-show="step2.legalPersonIdType=='ID_CARD'" >
          <span style="padding-right:4px;" >{{Labels.legalRepresentativeAgreeDiscriminateLegal}}</span>
          <span style="display:inline-flex;" >
            <label for="legal_face0" v-show="step2.legalPersonIdType == 'ID_CARD'" style="padding-right:10px;" ><input type="radio" id="legal_face0"  name="legal_face" value="0" @change="blurLegalFaceCheck(1)" style="vertical-align:-2px;margin:4px;" :checked="step2.legalPersonUseVerify" >{{Labels.agree!}}</label>
            <label for="legal_face1"><input type="radio" id="legal_face1" name="legal_face" value="1" @change="blurLegalFaceCheck(0)" style="vertical-align:-2px;margin:4px;" :checked="!step2.legalPersonUseVerify" >{{Labels.disagree}}</label>
          </span>
        </div>
        <div class="row" v-show="!step2.legalPersonUseVerify">
          <a target="_blank" href="/api/company/template?template=LEGAL_IDENTIFY_PAPER" class="report-alink" style="margin-left:220px;" >{{Labels.downloadCorporateStatementTemplate}}</a>
          <cf-upload
            ref="step2LicenceOssId4"
            :id="'step2LicenceOssId4'"
            :acceptType="['image','pdf']"
            ::title=="Labels.legalRepresentativeCertificateOfIdentificationBeInterrelatedState"
            ::inTitle=="Labels.corporateStatement"
            @ossSuccess="(data)=>(this.step2.legalPersonIdentificationPaper = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <div>
            <a class="cf-button prev-btn"  @click.prevent="prev_step" ref="step3"  target="_blank">{{Labels.returnBackToThe}}</a>
            <a class="cf-button cf-button--primary next-btn" @click.prevent="check_step2" target="_blank">{{Labels.nextStep}}</a>
          </div>
        </div>
      </div>
      <!-- 最后一步, 经办人/复核人信息 -->
      <div id="J_Company_Step3" :style="{display:nowStep==4?'block':'none'}" >
        <div class="row">
          <cf-upload
            ref="step3LicenceOssOperatorId1"
            :id="'step3LicenceOssOperatorId1'"
            :acceptType="'image'"
            :size="idCardSize"
            ::title=="Labels.operatorIdentityCardPhotographPhoto"
            :ocrUrl="'/matrix/idcard-recognition'"
            @ocrSuccess="ocrSuccessStep3LicenceOssOperatorId1"
            @ossSuccess="(data)=>(this.step3.operator.idFrontOssId = data.key)"
          ></cf-upload>
          <cf-upload
            ref="step3LicenceOssOperatorId2"
            :id="'step3LicenceOssOperatorId2'"
            :acceptType="'image'"
            :size="idCardSize"
            ::title=="Labels.operatorIdentityCardNationalEmblemNational"
            @ossSuccess="(data)=>(this.step3.operator.idBackOssId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>{{Labels.attentionLine}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step3.operator.name" placeholder=" {{Labels.uploadIdentityCardFetchFillIn}}" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.operatorIdIdCard}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step3.operator.idNo" placeholder=" {{Labels.uploadIdentityCardFetchFillIn}}" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.emailAddressOfOperator}}</label>
          <div>
            <input type="text" class="cf-input cf-input--long cf-input--readonly"  :value="operatorEmail" readonly>
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>{{Labels.operatorsMobilePhoneNumber}}</label>
          <div>
            <input type="number" v-integer class="cf-input cf-input--long" v-model="step3.operator.phone" placeholder=" {{Labels.importOperatorMobileNumberPlease}}" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <div style="padding-top:12px;" >
            <input type="number" v-integer class="cf-input cf-input--long" style="width:555px;vertical-align:top;" v-model="step3.operator.verificationCode" placeholder=" {{Labels.noteIdentifyingCodePleaseInput}}" >
            <a class="abs-button" ref="captcha" data-count="0" href="#" @click.prevent="VerifyOperatorPhone" >{{Labels.getCaptcha}}</a>
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <a target="_blank" href="/api/company/template?template=OPERATOR_AUTHORIZATION" class="report-alink" style="margin-left:130px;" >{{Labels.template}}</a>
          <cf-upload
            ref="step3LicenceOssOperatorId3"
            :id="'step3LicenceOssOperatorId3'"
            :acceptType="['image', 'pdf']"
            ::title=="Labels.powerOfAttorney"
            @ossSuccess="(data)=>(this.step3.operator.authorizationOssId = data.key)"
          ></cf-upload>
        </div>
        <!-- 添加复核人 -->
        <div class="row">
          <div class="hr20"></div>
          <a class="add-check-btn" style="display:none;" @click.prevent="addCheckPerson" >
            <span style="font-size:30px;vertical-align:middle;padding-right:6px;" >+</span>
            <span style="vertical-align:middle;" >{{Labels.addReviewerInformationOptional}}</span>
          </a>
          <div :style="{display: add_check_btn?'block':'none'}" >
            <div class="row">
              <cf-upload
                ref="step3LicenceOssCheckerId1"
                :id="'step3LicenceOssCheckerId1'"
                :acceptType="'image'"
                :size="idCardSize"
                ::title=="Labels.checkIdentityCardPhotographPhoto"
                ::inTitle=="Labels.checkIdentityCardPhotographPhoto"
                :ocrUrl="'/matrix/idcard-recognition'"
                @ocrSuccess="ocrSuccessStep3LicenceOssCheckerId1"
                @ossSuccess="(data)=>(this.step3.checker.idFrontOssId = data.key)"
              ></cf-upload>
              <cf-upload
                ref="step3LicenceOssCheckerId2"
                :id="'step3LicenceOssCheckerId2'"
                :acceptType="'image'"
                :size="idCardSize"
                ::title=="Labels.checkIdentityCardNationalEmblemNational"
                ::inTitle=="Labels.checkIdentityCardNationalEmblemNational"
                @ossSuccess="(data)=>(this.step3.checker.idBackOssId = data.key)"
              ></cf-upload>
            </div>
            <div class="in-row">
              <label>{{Labels.nameOfReviewerOptional}}</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.name" placeholder=" {{Labels.uploadIdentityCardFetchFillIn}}" >
              </div>
            </div>
            <div class="in-row">
              <label>{{Labels.checkIdIdCard}}</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.idNo" placeholder=" {{Labels.uploadIdentityCardFetchFillIn}}" >
              </div>
            </div>
            <div class="in-row">
              <label>{{Labels.checkPostboxEmailAddress}}</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.email" placeholder=" {{Labels.operatorTerraceRegisterWill}}" >
              </div>
            </div>
            <div class="in-row">
              <label>{{Labels.checkMobileNumberMobilePhone}}</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.phone" placeholder=" {{Labels.importOperatorMobileNumberPlease}}" >
              </div>
            </div>
            <div class="row">
              <cf-upload
                ref="step3LicenceOssCheckerId3"
                :id="'step3LicenceOssCheckerId3'"
                :acceptType="'image'"
                ::title=="Labels.powerOfAttorneyOptional"
                ::inTitle=="Labels.powerOfAttorney"
                @ossSuccess="(data)=>(this.step3.checker.authorizationOssId = data.key)"
              ></cf-upload>
            </div>
          </div>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <div>
            <a class="cf-button prev-btn"  @click.prevent="prev_step" ref="step4"  target="_blank">{{Labels.returnBackToThe}}</a>
            <a class="cf-button cf-button--primary next-btn" target="_blank" @click.prevent="check_step3" >{{Labels.nextStep}}</a>
          </div>
        </div>
      </div>
    </div>
    <cf-modal :show.sync="pop.ModalVisible" :hideFooter='pop.hideFooter' :size="'sm'" :maxLimit="false">
      <div slot="title">{{pop.title}}</div>
      <section class="pad-h-20 pad-t-20 pad-b-50">
        <div class="cf-inline cf-inline--wide" v-html="pop.body"></div>
      </section>
      <div slot="footer">
        <button type="button" :style="{'background':pop.ok?'white':'#00bc8d'}" class="cf-button cf-button--default cf-button--xs mar-r-10" @click="pop.ModalVisible=false" >{{pop.cancel}}</button>
        <button type="button" v-show="pop.ok" class="cf-button cf-button--primary cf-button--sm" @click.prevent="goToList()" >{{pop.ok}}</button>
      </div>
    </cf-modal>
    <cf-modal :show.sync="submitVisible" :hideFooter='true'>
      <div slot="title" ><span id="J_FundBack" ></span></div>
      <section style="text-align:center;">
        <div style="text-align:center; font-size:16px;"><b id="J-flow-second" >3</b>{{Labels.skipFirstPageJumpTo}}</div>
      </section>
    </cf-modal>
  </cf-panel>
</template>
<script>import { formatMessage } from '~/locale-tools';

/* eslint-disable */

import axios from 'axios';
import api from '@api';
import ProvinceCity from '@helper/district';
import beforeunload from '@helper/beforeunloadalert';
// oss 客户端js
import { UPLOAD_SIZE_IDCARD } from '@helper/const';
let pdfUrl = require('@/assets/pdf.png');
import Vue from 'vue';
import { mapMutations, mapState} from 'vuex';
import { SET_NOTIFIER_STATUS, SET_SUPPLIER_AUDIT_INFO} from '@store/types';

// 倒计时 dom元素， seconds秒
function FlowSecond(dom, seconds) {
  dom.innerHTML = seconds;

  return new Promise(resolve => {
    let count = seconds;
    let timer = setInterval(() => {
      count--;
      dom.innerHTML = count;

      if (count <= 0) {
        clearInterval(timer);
        resolve();
      }
    }, 1000);
  });
}

// oss显示图片
function displayImage(id, url, key) {
  let obj = document.getElementById(id);
  // title-headeer
  let oHeader = obj.getElementsByClassName('title-headeer');
  oHeader = oHeader[0];
  oHeader.classList.add('active');

  if (id == 'J_Company_Step2_img3') {
    // pdf

    obj.style.background = `url(${pdfUrl}) center center no-repeat`;
    obj.style.backgroundSize = 'contain';

    oHeader.querySelector('a').innerHTML = `${key.split('__')[1]}`;
  } else {
    obj.style.background = `url(${url}) center center no-repeat`;
    obj.style.backgroundSize = 'contain';

    oHeader.querySelector('a').innerHTML = `${formatMessage({id: 'view-picture'})}`;
  }

  oHeader.querySelector('a').href = `${url}`;

}

// 上传文件
function uploadFile(id, url) {
  let oInput = document.getElementById(id).getElementsByTagName('input')[0];

  return new Promise((resolve, reject) => {
    // resolve({
    //   result:"success",
    //   content:{}
    // });

    let oFile = oInput.files[0];
    let formData = new FormData();
    formData.append('image', oFile);

    let xhr = new XMLHttpRequest();
    xhr.open('POST', process.env.API_ROOT + url, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      resolve(xhr.response);
    };

    xhr.onerror = () => {
      reject(500);
    };

    xhr.send(formData);
  });
}

// 错误提示定位
function goToErr(div_id, index) {
  let oDiv = document.getElementById(div_id);
  oDiv.querySelectorAll('.row')[index].className = 'row error';
  oDiv.querySelectorAll('.row')[index].scrollIntoView();

  for (let key in goToErr) {
    if ('timer' + index != key) {
      clearTimeout(goToErr[key]);
      oDiv.querySelectorAll('.row')[key.substring(5)] &&
        (oDiv.querySelectorAll('.row')[key.substring(5)].className = 'row');
    }
  }

  goToErr['timer' + index] = setTimeout(() => {
    clearTimeout(goToErr['timer' + index]);

    oDiv.querySelectorAll('.row')[index].className = 'row';
  }, 4 * 1000);
}

let isNormalGo = false; // 是否是正常提交后的调整，不是的话要提示

// 企业管理数据
let VueData = {
  redirect: '/', // 重定向到的位置
  breadcrumbData: [{ name: formatMessage({id: 'improve-enterprise-information'}) }],
  nowStep: 1,
  dotArr: [formatMessage({id: 'basic-information-of-enterprise'}), formatMessage({id: 'bank-account-information'}), formatMessage({id: 'information-of-legal-representative'}), formatMessage({id: 'operator-information'}), formatMessage({id: 'identity-authentication'})],
  idCardSize: UPLOAD_SIZE_IDCARD,
  errMsg: '',
  add_check_btn: false,
  is_long_period: true, // 是否长期的
  allBanks: [],
  allIDtypes:[],
  submitVisible: false,
  foundDate: Vue.filter('formatDate')(Date.now()),
  dueDate: Vue.filter('formatDate')(Date.now()),
  legalName: '',
  licenceOssIdResetFlag: false,
  pop: {
    title: formatMessage({id: 'legal-representative-attestation-identity-authentication'}),
    ModalVisible: false,
    body:
      formatMessage({id: 'handset-scan-below-two-dimensional-code'}),
    ok: formatMessage({id: 'view-enterprise'}),
    cancel: formatMessage({id: 'cancel'}),
    hideFooter: false,
  },
  step0: {
    companyId: '',
    licenceOssId: '',
    companyName: '',
    usci: '',
    companyTel:'',
    companyAddressProvince: '',
    companyAddressCity: '',
    companyAddress: '',
    legalPersonName: '',
    foundDate: '',
    dueDate: '',
    longTermFlag: true,
    companyCreditReportId: '',
    companyCreditAuthorizationId:'',
  },
  step1: {
    bankAccount: '',
    bankId: '',
    branchBankProvince: '',
    branchBankCity: '',
    branchBankName: '',
  },
  step2: {
    legalPersonFrontOssId: '',
    legalPersonBackOssId: '',
    legalPersonId: '',
    legalPersonEmail: '',
    legalPersonPhone: '',
    legalPersonCreditReportOssId: '',
    legalPersonIdentificationPaper:'',
    legalPersonUseVerify:true, // true:同意， false:不同意
    legalPersonIdType: '',
  },
  step3: {
    operator: {
      idFrontOssId: '',
      idBackOssId: '',
      name: '',
      idNo: '',
      email: '',
      phone: '',
      verificationCode:'',
      authorizationOssId: '',
    },
    checker: {
      idFrontOssId: '',
      idBackOssId: '',
      name: '',
      idNo: '',
      email: '',
      phone: '',
      authorizationOssId: '',
    },
  },
};

export default {
  name: '',
  async mounted() {

    try {
      // 获取银行列表 -- 第二步
      const bankRes = await api.allBanks();
      const bankList = bankRes.data.content || [];
      this.allBanks = bankList.map(bank => ({
        value: bank.id,
        name: bank.name,
      }));

      // 获取 证件类型数 第三步
      const IDtypes = await api.getIdtypesidtypes();
      const IDtypeList = IDtypes.data.content || [];
      this.allIDtypes  = IDtypeList.map( (IDobj, index) => ({
        value: IDobj.value,
        name: IDobj.name,
      }) );

    } catch (e) {};

    if( this.$route.query.step ){
      VueData.nowStep = +this.$route.query.step; // 如果是人脸识别页中点击修改经办人或者法人
    }else{
      VueData.nowStep = 1; // 默认进来都是第一步开始
    }


    VueData.submitVisible = false;
    document.getElementById('J_FundBack').innerHTML = formatMessage({id: 'supplier-information-completed-successfully'});

    let data = await api.companyDetails();

    if (data.result != 'success') {
      this[SET_NOTIFIER_STATUS]({
        show: true,
        text: formatMessage({id: 'gain-supplier-wrong-access'}),
        duration: 1500,
      });
      return;
    }

    if( data.content.companyVO.longTermFlag === null ){
      data.content.companyVO.longTermFlag = true;
    }

    VueData.step0 = {
      companyId: data.content.companyVO.id,
      licenceOssId: data.content.companyVO.licenceOssId,
      companyName: data.content.companyVO.companyName,
      usci: data.content.companyVO.usci,
      companyTel:data.content.companyVO.companyTel,
      companyAddressProvince: data.content.companyVO.companyAddressProvince || '',
      companyAddressCity: data.content.companyVO.companyAddressCity || '',
      companyAddress: data.content.companyVO.companyAddress,
      legalPersonName: data.content.companyVO.legalPersonName,
      foundDate: data.content.companyVO.foundDate,
      dueDate: data.content.companyVO.dueDate,
      longTermFlag: data.content.companyVO.longTermFlag,
      companyCreditReportId: data.content.companyVO.companyCreditReportId,
      companyCreditAuthorizationId: data.content.companyVO.companyCreditAuthorizationId
    };
    VueData.step1 = {
      bankAccount: data.content.companyVO.bankAccount,
      bankId: data.content.companyVO.bankId,
      branchBankProvince: data.content.companyVO.branchBankProvince || '',
      branchBankCity: data.content.companyVO.branchBankCity || '',
      branchBankName: data.content.companyVO.branchBankName,
    };
    VueData.step2 = {
      legalPersonFrontOssId: data.content.companyVO.legalPersonFrontOssId,
      legalPersonBackOssId: data.content.companyVO.legalPersonBackOssId,
      legalPersonId: data.content.companyVO.legalPersonId,
      legalPersonEmail: data.content.companyVO.legalPersonEmail,
      legalPersonPhone: data.content.companyVO.legalPersonPhone,
      legalPersonCreditReportOssId: data.content.companyVO.legalPersonCreditReportOssId,
      legalPersonIdentificationPaper: data.content.companyVO.legalPersonIdentificationPaper,
      legalPersonUseVerify: data.content.companyVO.legalPersonUseVerify,
      legalPersonIdType: data.content.companyVO.legalPersonIdType || 'ID_CARD',
    };
    // VueData.step0.
    VueData.step3.operator = data.content.operator;
    if (data.content.checker) {
      VueData.step3.checker = data.content.checker;
    } else {
      VueData.step3.checker = {
        idFrontOssId: '',
        idBackOssId: '',
        name: '',
        idNo: '',
        email: '',
        phone: '',
        authorizationOssId: '',
      };
    }
    VueData.step3.operator.email = this.operatorEmail;
    // 选择的银行
    if (data.content.companyVO.bankId) {
      this.allBanks = this.allBanks.map(obj => {
        if (obj.value == data.content.companyVO.bankId) {
          obj.selected = true;
        }
        return obj;
      });
    }

    // 选择的证件
    if( data.content.companyVO.legalPersonIdType ){
      this.allIDtypes = this.allIDtypes.map(obj => {
        if (obj.value == data.content.companyVO.legalPersonIdType) {
          obj.selected = true;
        }
        return obj;
      });
    }

    // 营业期限
    if (VueData.step0.longTermFlag) {
      // 长期
      this.is_long_period = true;
    } else {
      this.is_long_period = false;
      // 既然是非长期的，就给个到期日期填进去
      this.dueDate = VueData.step0.dueDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1/$2/$3');
    }

    // 法定人姓名
    VueData.legalName = VueData.step0.legalPersonName;

    // 到期时间
    // this.foundDate = VueData.step0.foundDate.replace(/^(\d{4})(\d{2})(\d{2})$/,'$1/$2/$3');

    // 时间
    // Vue.filter("formatDate")(Date.now())
    if (VueData.step0.foundDate) {
      this.foundDate = VueData.step0.foundDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1/$2/$3');
    } else {
      this.foundDate = Vue.filter('formatDate')(Date.now());
    }

    // 第一步(营业执照)
    (() => {
      const { licenceOssId, companyCreditReportId, companyCreditAuthorizationId } = VueData.step0;
      licenceOssId && this.$refs.step0LicenceOssId.showPic(false, { key: licenceOssId });
      companyCreditReportId && this.$refs.step0companyCreditReportId.showPic(false, { key: companyCreditReportId });
      companyCreditAuthorizationId && this.$refs.step0companyCreditAuthorizationId.showPic(false, { key: companyCreditAuthorizationId });
    })();

    // 第三步(法定代表人身份证和法定代表人个人征信报告)
    (() => {
      const { legalPersonFrontOssId, legalPersonBackOssId, legalPersonCreditReportOssId, legalPersonIdentificationPaper } = VueData.step2;
      legalPersonFrontOssId && this.$refs.step2LicenceOssId1.showPic(false, { key: legalPersonFrontOssId });
      legalPersonBackOssId && this.$refs.step2LicenceOssId2.showPic(false, { key: legalPersonBackOssId });

      legalPersonCreditReportOssId &&
        this.$refs.step2LicenceOssId3.showPic(false, { key: legalPersonCreditReportOssId });

      legalPersonIdentificationPaper && this.$refs.step2LicenceOssId4.showPic(false, { key: legalPersonIdentificationPaper });

    })();

    // 第四步(经办人/复核人身份证和授权委托书)
    (() => {
      // 经办人
      const { operator } = VueData.step3;
      operator.idFrontOssId && this.$refs.step3LicenceOssOperatorId1.showPic(false, { key: operator.idFrontOssId });
      operator.idBackOssId && this.$refs.step3LicenceOssOperatorId2.showPic(false, { key: operator.idBackOssId });

      operator.authorizationOssId &&
        this.$refs.step3LicenceOssOperatorId3.showPic(false, { key: operator.authorizationOssId });

      // 复核人
      let checker = VueData.step3.checker || {};
      checker.idFrontOssId && this.$refs.step3LicenceOssCheckerId1.showPic(false, { key: checker.idFrontOssId });
      checker.idBackOssId && this.$refs.step3LicenceOssCheckerId2.showPic(false, { key: checker.idBackOssId });

      checker.authorizationOssId &&
        this.$refs.step3LicenceOssCheckerId3.showPic(false, { key: checker.authorizationOssId });
    })();

    // } ////////////////////////////////////

    let address = new ProvinceCity(document.getElementById('address')); // 公司地址
    let addressBank = new ProvinceCity(document.getElementById('addressBank')); // 开户省市
  },
  beforeRouteEnter(to, from, next) {
    isNormalGo = false;
    beforeunload.on();
    next();
  },
  beforeRouteLeave(to, from, next) {
    let ret = true;
    if (!isNormalGo && to.name !== 'login') {
      ret = beforeunload.back();
    }
    if (ret) {
      beforeunload.off();
      next();
    }
  },
  data: () => {
    return VueData;
  },
  computed: {
    ...mapState({
      operatorEmail: state => state.profile.email,
    }),
  },
  methods: {
    ...mapMutations({
      SET_NOTIFIER_STATUS,
      SET_SUPPLIER_AUDIT_INFO,
    }),
    goToList() {
      this.pop.ModalVisible = false;
    },
    //  法定代表人同意人脸识别相关操作
    blurLegalFaceCheck( val ){
      // alert(val);
      this.step2.legalPersonUseVerify = val ? true:false;
    },
    changeBank(val) {
      this.step1.bankId = val.value;
    },

    changeIDtype(val){

      this.step2.legalPersonIdType = val.value;
      this.licenceOssIdResetFlag=!this.licenceOssIdResetFlag;
      this.step2.legalPersonFrontOssId = this.step2.legalPersonBackOssId ='';
      this.step2.legalPersonId = '';

      if( val.value != 'ID_CARD' ){
        this.step2.legalPersonUseVerify = false;
      }else{
        this.step2.legalPersonUseVerify = true;
      }

      // 看是否选中了护照
      if( val.value == 'PASSPORT' ){
        document.getElementById('J_Passport').style.display = 'none';
      }else{
        document.getElementById('J_Passport').style.display = '';
      }

    },

    changePeriod() {
      this.is_long_period = !this.is_long_period;
    },
    // 选择成立日期
    pickFoundDate(data) {
      this.step0.foundDate = `${data.year}${data.month < 10 ? '0' + data.month : data.month}${
        data.date < 10 ? '0' + data.date : data.date
      }`;
    },
    // 选择到期日
    pickDueDate(data) {
      this.step0.dueDate = `${data.year}${data.month < 10 ? '0' + data.month : data.month}${
        data.date < 10 ? '0' + data.date : data.date
      }`;
    },
    // 返回上一步
    prev_step() {
      this.nowStep--;
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    },
    // 添加复核人
    addCheckPerson() {
      this.add_check_btn = true;
    },

    // 营业执照OCR识别完成
    ocrSuccessStep0LicenceOssId(data) {
      if (data == 500) return false;

      const {
        bizLicenseCompanyName,
        bizLicenseCreditCode,
        bizLicenseOwnerName,
        bizLicenseAddress,
        bizLicenseStartTime,
        bizLicenseEndTime,
      } =
        data.content || {};

      if (bizLicenseCompanyName) {
        this.step0.companyName = bizLicenseCompanyName;
        this.step0.usci = bizLicenseCreditCode;
        this.step0.legalPersonName = bizLicenseOwnerName;
        this.step0.companyAddress = bizLicenseAddress;
        this.foundDate = bizLicenseStartTime ? bizLicenseStartTime.replace(/-/g, '/') : this.foundDate;
        if (bizLicenseEndTime) {
          this.is_long_period = false;
          this.dueDate = bizLicenseEndTime.replace(/-/g, '/');
        } else {
          // 长期
          this.is_long_period = true;
        }
      }
    },

    // 法定代表人身份证OCR识别成功（正面）
    ocrSuccessStep2LicenceOssId1(data) {
      this.step2.legalPersonId = data.content.ssn;
      this.legalName = data.content.name;

      if (this.legalName != this.step0.legalPersonName) {
        this.pop.title = formatMessage({id: 'legal-representative-information-atypism-inconsistent'});
        this.pop.ModalVisible = true;
        (this.pop.body = `${formatMessage({id: 'legal-representative-status-business-license-atypism'})}`),
          (this.pop.ok = '');
        this.pop.cancel = formatMessage({id: 'confirm'});
      }
    },

    // 经办人身份证OCR识别成功（正面）
    ocrSuccessStep3LicenceOssOperatorId1(data) {
      this.step3.operator.idNo = data.content.ssn;
      this.step3.operator.name = data.content.name;
    },

    // 复核人身份证OCR识别成功（正面）
    ocrSuccessStep3LicenceOssCheckerId1(data) {
      this.step3.checker.idNo = data.content.ssn;
      this.step3.checker.name = data.content.name;
    },

    // 发送验证码
    async VerifyOperatorPhone(){

      if( !this.step3.operator.phone ){
        goToErr('J_Company_Step3', 4);
        return this.errMsg = formatMessage({id: 'import-mobile-number-please-enter'});
      }

      if( !/^1\d{10}$/.test(this.step3.operator.phone) ){
        goToErr('J_Company_Step3', 4);
        return this.errMsg = formatMessage({id: 'incorrect-mobile-phone-number'});
      }

      let timer;

      // this.$refs.captcha
      let oCaptcha = this.$refs.captcha;
      if( +oCaptcha.dataset.count ){
        return;
      }

      let params = {
        phone:this.step3.operator.phone,
      };

      try{
        let data = (await api.supplierVerifyPhone(
          {params},
        )).data;

        // console.log(data);
        if( data.result == 'error' ){
          resetCaptcha();
          return;
        }

        // 60S倒计时
        let Count = 60;
        oCaptcha.dataset.count = 60;

        timer = setInterval( ()=>{
          oCaptcha.innerHTML = `${formatMessage({id: 'send-verification-code（'})}${Count}s)`;
          oCaptcha.style.color = '#999';
          oCaptcha.style.borderColor = '#999';
          Count --;
          if( Count == 0 ){
            resetCaptcha();
          }

        }, 1000 );

      }catch(e){
        console.log(e);
        // resetCaptcha();
        // goToErr('J_Company_Step3', 4);
        // this.errMsg = '该手机号码被注册';
        // alert(JSON.stringify(e));
      }

      function resetCaptcha(){
        oCaptcha.innerHTML = `${formatMessage({id: 'send-verification-code'})}`;
        oCaptcha.style.color = '';
        oCaptcha.style.borderColor = '';
        oCaptcha.dataset.count = 0;
        clearInterval(timer);
      }

    },

    async check_step0() {
      if (!this.step0.licenceOssId) {
        this.$refs.step0LicenceOssId.showErrorMsg(formatMessage({id: 'please-upload-business-license'}));
        return false;
      }

      // goToErr(div_id, index, msg)
      // 公司全称
      if (this.step0.companyName) {
      } else {
        goToErr('J_Company_Step0', 1);
        this.errMsg = formatMessage({id: 'fill-in-corporate-name-please-fill'});
        return false;
      }

      // 统一社会信用代码
      if (this.step0.usci) {
      } else {
        goToErr('J_Company_Step0', 2);
        this.errMsg = formatMessage({id: 'fill-in-trustworthiness-code-please'});
        return false;
      }

      /*
      18位数字及大写字母任意组合。可以全数字，可以全字母，可以混合数字和字母。(字母大写)
      */
      if (!/^[A-Z\d]{18}$/.test(this.step0.usci)) {
        goToErr('J_Company_Step0', 2);
        this.errMsg = formatMessage({id: 'unify-society-trustworthiness-code'});
        return false;
      }

      // 公司电话
      if( !this.step0.companyTel ){
        goToErr('J_Company_Step0', 3);
        this.errMsg = formatMessage({id: 'fill-in-telephone-please-fill'});
        return false;
      }

      //  公司地址 检查省市
      let address = document.getElementById('address');
      let sProvince = address.dataset.province;
      if (sProvince) {
        this.step0.companyAddressProvince = address.dataset.province;
        this.step0.companyAddressCity = address.dataset.city;
      } else {
        goToErr('J_Company_Step0', 4);
        this.errMsg = formatMessage({id: 'select-corporation-please-select'});
        return false;
      }

      if (this.step0.companyAddress) {
      } else {
        goToErr('J_Company_Step0', 5);
        this.errMsg = formatMessage({id: 'fill-in-address-please-fill'});
        return false;
      }

      // 法定代表人姓名
      if (this.step0.legalPersonName) {
      } else {
        goToErr('J_Company_Step0', 6);
        this.errMsg = formatMessage({id: 'fill-in-legal-representative-surname-and-personal-name-please'});
        return false;
      }

      // 日期替换
      this.step0.foundDate = this.step0.foundDate || this.foundDate;
      // 成立日期
      if (!this.step0.foundDate) {
        goToErr('J_Company_Step0', 7);
        this.errMsg = formatMessage({id: 'fill-in-date-please-fill'});
        return false;
      }

      this.step0.foundDate = this.step0.foundDate.replace(/\//g, '');

      if (document.getElementById('r1').checked) {
        // 长期
        this.step0.dueDate = formatMessage({id: 'long-term'});
        this.step0.longTermFlag = 1;
      } else {
        this.step0.longTermFlag = 0;
        // 营业到期日
        if (!this.step0.dueDate) {
          if (this.dueDate) {
            this.step0.dueDate = this.dueDate;
          } else {
            goToErr('J_Company_Step0', 8);
            this.errMsg = formatMessage({id: 'fill-in-date-due-please-fill'});
            return false;
          }
        }

        this.step0.dueDate = this.step0.dueDate.replace(/\//g, '');

        // 到期日必须大于成立日期
        if (+this.step0.dueDate <= +this.step0.foundDate) {
          goToErr('J_Company_Step0', 8);
          this.errMsg = formatMessage({id: 'do-business-date-due-greater-than-business'});
          return false;
        }
      }

      // 企业征信查询授权书
      if( !this.step0.companyCreditAuthorizationId ){
        this.$refs.step0companyCreditAuthorizationId.showErrorMsg(formatMessage({id: 'upload-financial-statement-of-income-and-expenditure-of-a-foundation-etc-letter-of-authorization-please'}));
        return false;
      }

      // 可以到下一步了
      let data;

      try {
        data = (await api.createStepOne(this.step0)).data;
      } catch (e) {
        if (e.errorCode == '1010') {
          this.pop.title = formatMessage({id: 'the-enterprise-already-exists'});
          this.pop.ModalVisible = true;
          (this.pop.body = `${formatMessage({id: 'unify-society-trustworthiness-code-1'})}`), (this.pop.ok = 'OK');
          this.pop.cancel = formatMessage({id: 'cancel'});
          return;
        }
      }

      if (data.result == 'success') {
        // this.step0.companyId = data.content; 已经有了companyId，这儿就不用了
        this.nowStep = 2;
        document.documentElement.scrollTop = document.body.scrollTop = 0;
      }
    },
    async check_step1() {
      // 银行账号
      if (this.step1.bankAccount) {
      } else {
        goToErr('J_Company_Step1', 0);
        this.errMsg = formatMessage({id: 'fill-in-bank-account-please-fill'});
        return false;
      }

      if (!/^\d+[-\d]*\d+$/.test(this.step1.bankAccount)) {
        goToErr('J_Company_Step1', 0);
        this.errMsg = formatMessage({id: 'bank-account-form-incorrect-format'});
        return false;
      }

      if (this.step1.bankAccount.length < 5 || this.step1.bankAccount.length > 30) {
        goToErr('J_Company_Step1', 0);
        this.errMsg = formatMessage({id: 'bank-account-character-the-bank'});
        return false;
      }

      // 请选择银行
      if (this.step1.bankId) {
      } else {
        goToErr('J_Company_Step1', 1);
        this.errMsg = formatMessage({id: 'please-select-your-bank'});
        return false;
      }

      // 开户省市
      let address = document.getElementById('addressBank');
      let sProvince = address.dataset.province;

      if (sProvince) {
        this.step1.branchBankProvince = address.dataset.province;
        this.step1.branchBankCity = address.dataset.city;
      } else {
        goToErr('J_Company_Step1', 2);
        this.errMsg = formatMessage({id: 'select-open-an-account-please-select'});
        return false;
      }

      // 开户支行
      if (this.step1.branchBankName) {
      } else {
        goToErr('J_Company_Step1', 3);
        this.errMsg = formatMessage({id: 'open-an-account-subbranch-please-fill'});
        return false;
      }

      // 可以到下一步了
      try {
        let data = (await api.createStepTwo({ ...this.step1, companyId: this.step0.companyId })).data;

        if (data.result == 'success') {
          this.nowStep = 3;
          document.documentElement.scrollTop = document.body.scrollTop = 0;
        }
      } catch (e) {
        this.pop.title = formatMessage({id: 'error'});
        this.pop.ModalVisible = true;
        (this.pop.body = e.errorMsg), (this.pop.ok = 'OK');
        this.pop.cancel = formatMessage({id: 'cancel'});
      }
    },
    async check_step2() {
      // 身份证姓名与法定代表人姓名对比
      if( this.step2.legalPersonIdType == 'ID_CARD' ){
        if (this.legalName != this.step0.legalPersonName) {
          this.pop.title = formatMessage({id: 'legal-representative-information-atypism-inconsistent'});
          this.pop.ModalVisible = true;
          (this.pop.body = `${formatMessage({id: 'legal-representative-status-business-license-atypism'})}`),
            (this.pop.ok = '');
          this.pop.cancel = formatMessage({id: 'confirm'});
          return false;
        }
      }

      // 法定代表人身份证照片面
      if (!this.step2.legalPersonFrontOssId) {
        this.$refs.step2LicenceOssId1.showErrorMsg(formatMessage({id: 'upload-legal-representative-credentials-please'}));
        return false;
      }

      // 法定代表人身份证国徽面
      if( this.step2.legalPersonIdType != 'PASSPORT' ){
        // 如果不是护照，就要看反面
        if (!this.step2.legalPersonBackOssId) {
          this.$refs.step2LicenceOssId2.showErrorMsg(formatMessage({id: 'legal-representative-credentials-the-back-please'}));
          return false;
        }
      }

      //核查身份证
      // /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
      if (this.step2.legalPersonId) {
      } else {
        goToErr('J_Company_Step2', 1);
        this.errMsg = formatMessage({id: 'fill-in-credentials-please-fill'});
        return false;
      }

      if( this.step2.legalPersonIdType == 'ID_CARD' ){
        if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.step2.legalPersonId)) {
          goToErr('J_Company_Step2', 1);
          this.errMsg = formatMessage({id: 'id-form-incorrect-format'});
          return false;
        }
      }

      // 邮箱
      if (this.step2.legalPersonEmail) {
      } else {
        goToErr('J_Company_Step2', 2);
        this.errMsg = formatMessage({id: 'fill-in-postbox-please-fill'});
        return false;
      }

      // /^[-.\w]+@([\w-]+\.)+[\w-]{2,20}$/
      if (!/^[-.\w]+@([\w-]+\.)+[\w-]{2,20}$/.test(this.step2.legalPersonEmail)) {
        goToErr('J_Company_Step2', 2);
        this.errMsg = formatMessage({id: 'email-format-error'});
        return false;
      }

      // 手机
      if (this.step2.legalPersonPhone) {
      } else {
        goToErr('J_Company_Step2', 3);
        this.errMsg = formatMessage({id: 'fill-in-please-fill-in'});
        return false;
      }

      if (!/^\d{11}$/.test(this.step2.legalPersonPhone)) {
        goToErr('J_Company_Step2', 3);
        this.errMsg = formatMessage({id: 'handset-form-mobile-number-mobile'});
        return false;
      }

      // 法人不同意人脸识别
      if (!this.step2.legalPersonUseVerify && !this.step2.legalPersonIdentificationPaper) {
        this.$refs.step2LicenceOssId4.showErrorMsg(formatMessage({id: 'upload-legal-representative-certificate-of-identification-be-interrelated'}));
        return false;
      }

      // 可以到下一步了
      try {
        let data = (await api.createStepThree({ ...this.step2, companyId: this.step0.companyId })).data;

        if (data.result == 'success') {
          this.nowStep = 4;
          document.documentElement.scrollTop = document.body.scrollTop = 0;
        }
      } catch (e) {
        this.pop.title = formatMessage({id: 'error'});
        this.pop.ModalVisible = true;
        (this.pop.body = e.errorMsg), (this.pop.ok = 'OK');
        this.pop.cancel = formatMessage({id: 'cancel'});
      }
    },
    // 最终提交
    async check_step3() {
      // 经办人身份证照片面
      if (!this.step3.operator.idFrontOssId) {
        this.$refs.step3LicenceOssOperatorId1.showErrorMsg(formatMessage({id: 'upload-operator-identity-card-photograph'}));
        return false;
      }

      // 经办人身份证国徽面
      if (!this.step3.operator.idBackOssId) {
        this.$refs.step3LicenceOssOperatorId2.showErrorMsg(formatMessage({id: 'upload-operator-identity-card-national-emblem'}));
        return false;
      }

      // 经办人
      // 经办人姓名
      if (this.step3.operator.name) {
      } else {
        goToErr('J_Company_Step3', 1);
        this.errMsg = formatMessage({id: 'fill-in-operator-please-fill'});
        return false;
      }

      // 经办人身份证号
      if (this.step3.operator.idNo) {
      } else {
        goToErr('J_Company_Step3', 2);
        this.errMsg = formatMessage({id: 'fill-in-operator-id-please'});
        return false;
      }

      if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.step3.operator.idNo)) {
        goToErr('J_Company_Step3', 2);
        this.errMsg = formatMessage({id: 'id-form-incorrect-format'});
        return false;
      }

      // 手机
      if (this.step3.operator.phone) {
      } else {
        goToErr('J_Company_Step3', 4);
        this.errMsg = formatMessage({id: 'fill-in-mobile-number-please-fill'});
        return false;
      }

      // 13
      if (!/^\d{11}$/.test(this.step3.operator.phone)) {
        goToErr('J_Company_Step3', 4);
        this.errMsg = formatMessage({id: 'wrong-cell-phone-number'});
        return false;
      }

      // 手机验证码
      if( !this.step3.operator.verificationCode ){
        goToErr('J_Company_Step3', 5);
        this.errMsg = formatMessage({id: 'handset-identifying-code-please-input'});
        return false;
      }

      // 授权委托书
      if (!this.step3.operator.authorizationOssId) {
        this.$refs.step3LicenceOssOperatorId3.showErrorMsg(formatMessage({id: 'upload-letter-of-authorization-please-upload'}));
        return false;
      }

      // 提交
      // 可以到下一步了
      let submitData;
      if (this.add_check_btn) {
        submitData = [
          { ...this.step3.operator, /*companyId:10171*/ companyId: this.step0.companyId },
          { ...this.step3.checker, companyId: this.step0.companyId },
        ];
      } else {
        submitData = [{ ...this.step3.operator, /*companyId:10171*/ companyId: this.step0.companyId }];
      }

      try {
        let data = (await api.createStepFour(submitData)).data;

        if (data.result == 'success') {
          isNormalGo = true;
          // const { content: supplierAuditInfo } = await api.getSupplierAuditInfo();
          // this[SET_SUPPLIER_AUDIT_INFO](supplierAuditInfo);
          this.$router.push({
            name: 'qrAuthentication',
            query:{
              legalface: this.step2.legalPersonUseVerify ? 1 : 0,
            },
          });
        }
      } catch (e) {
        this.pop.title = formatMessage({id: 'submit-failed'});
        this.pop.ModalVisible = true;
        (this.pop.body = e.errorMsg), (this.pop.ok = '');
        this.pop.cancel = formatMessage({id: 'confirm'});
      }
    },
  },data(){return { Labels: {
  "businessLicense": formatMessage({id: 'business-license'}),
  "fullNameOfCompany": formatMessage({id: 'full-name-of-company'}),
  "uploadBusinessLicenseFetchFillIn": formatMessage({id: 'upload-business-license-fetch-fill-in'}),
  "unifiedSocialCreditCode": formatMessage({id: 'unified-social-credit-code'}),
  "companyPhone": formatMessage({id: 'company-phone'}),
  "fillInTelephonePleaseFill": formatMessage({id: 'fill-in-telephone-please-fill'}),
  "companyAddress": formatMessage({id: 'company-address'}),
  "nameOfLegalRepresentative": formatMessage({id: 'name-of-legal-representative'}),
  "dateOfEstablishment": formatMessage({id: 'date-of-establishment'}),
  "businessDueDate": formatMessage({id: 'business-due-date'}),
  "template": formatMessage({id: 'template'}),
  "financialStatementOfIncomeAndExpenditureOfAFoundationEtcLetterOfAuthorizationLetterOf": formatMessage({id: 'financial-statement-of-income-and-expenditure-of-a-foundation-etc-letter-of-authorization-letter-of'}),
  "enterpriseCreditReportOptional": formatMessage({id: 'enterprise-credit-report-optional'}),
  "nextStep": formatMessage({id: 'next-step'}),
  "nameOfEnterprise": formatMessage({id: 'name-of-enterprise'}),
  "bankAccount": formatMessage({id: 'bank-account'}),
  "importBankAccountPleaseInput": formatMessage({id: 'import-bank-account-please-input'}),
  "bank": formatMessage({id: 'bank'}),
  "pleaseSelectYourBank": formatMessage({id: 'please-select-your-bank'}),
  "openAnAccountProvinceAndCity": formatMessage({id: 'open-an-account-province-and-city'}),
  "accountOpeningBranch": formatMessage({id: 'account-opening-branch'}),
  "subbranchNamePleaseEnter": formatMessage({id: 'subbranch-name-please-enter'}),
  "returnBackToThe": formatMessage({id: 'return-back-to-the'}),
  "documentType": formatMessage({id: 'document-type'}),
  "pleaseSelectACertificate": formatMessage({id: 'please-select-a-certificate'}),
  "certificateOfLegalRepresentative": formatMessage({id: 'certificate-of-legal-representative'}),
  "frontOfCertificate": formatMessage({id: 'front-of-certificate'}),
  "backOfCertificate": formatMessage({id: 'back-of-certificate'}),
  "legalRepresentativeCredentialsCertificateNumber": formatMessage({id: 'legal-representative-credentials-certificate-number'}),
  "uploadCredentialsFetchFillIn": formatMessage({id: 'upload-credentials-fetch-fill-in'}),
  "legalRepresentativePostboxEmailAddress": formatMessage({id: 'legal-representative-postbox-email-address'}),
  "importLegalRepresentativePostboxPlease": formatMessage({id: 'import-legal-representative-postbox-please'}),
  "legalRepresentativeMobileNumberMobilePhone": formatMessage({id: 'legal-representative-mobile-number-mobile-phone'}),
  "importLegalRepresentativeMobileNumberPlease": formatMessage({id: 'import-legal-representative-mobile-number-please'}),
  "legalRepresentativeIndividualFinancialStatementOfIncomeAndExpenditureOfAFoundationEtcReport": formatMessage({id: 'legal-representative-individual-financial-statement-of-income-and-expenditure-of-a-foundation-etc-report'}),
  "legalRepresentativeFinancialStatementOfIncomeAndExpenditureOfAFoundationEtcReportPersonal": formatMessage({id: 'legal-representative-financial-statement-of-income-and-expenditure-of-a-foundation-etc-report-personal'}),
  "legalRepresentativeAgreeDiscriminateLegal": formatMessage({id: 'legal-representative-agree-discriminate-legal'}),
  "agree!": formatMessage({id: 'agree!'}),
  "disagree": formatMessage({id: 'disagree'}),
  "downloadCorporateStatementTemplate": formatMessage({id: 'download-corporate-statement-template'}),
  "legalRepresentativeCertificateOfIdentificationBeInterrelatedState": formatMessage({id: 'legal-representative-certificate-of-identification-be-interrelated-state'}),
  "corporateStatement": formatMessage({id: 'corporate-statement'}),
  "operatorIdentityCardPhotographPhoto": formatMessage({id: 'operator-identity-card-photograph-photo'}),
  "operatorIdentityCardNationalEmblemNational": formatMessage({id: 'operator-identity-card-national-emblem-national'}),
  "attentionLine": formatMessage({id: 'attention-line'}),
  "uploadIdentityCardFetchFillIn": formatMessage({id: 'upload-identity-card-fetch-fill-in'}),
  "operatorIdIdCard": formatMessage({id: 'operator-id-id-card'}),
  "emailAddressOfOperator": formatMessage({id: 'email-address-of-operator'}),
  "operatorsMobilePhoneNumber": formatMessage({id: 'operators-mobile-phone-number'}),
  "importOperatorMobileNumberPlease": formatMessage({id: 'import-operator-mobile-number-please'}),
  "noteIdentifyingCodePleaseInput": formatMessage({id: 'note-identifying-code-please-input'}),
  "getCaptcha": formatMessage({id: 'get-captcha'}),
  "powerOfAttorney": formatMessage({id: 'power-of-attorney'}),
  "addReviewerInformationOptional": formatMessage({id: 'add-reviewer-information-optional'}),
  "checkIdentityCardPhotographPhoto": formatMessage({id: 'check-identity-card-photograph-photo'}),
  "checkIdentityCardNationalEmblemNational": formatMessage({id: 'check-identity-card-national-emblem-national'}),
  "nameOfReviewerOptional": formatMessage({id: 'name-of-reviewer-optional'}),
  "checkIdIdCard": formatMessage({id: 'check-id-id-card'}),
  "checkPostboxEmailAddress": formatMessage({id: 'check-postbox-email-address'}),
  "operatorTerraceRegisterWill": formatMessage({id: 'operator-terrace-register-will'}),
  "checkMobileNumberMobilePhone": formatMessage({id: 'check-mobile-number-mobile-phone'}),
  "powerOfAttorneyOptional": formatMessage({id: 'power-of-attorney-optional'}),
  "skipFirstPageJumpTo": formatMessage({id: 'skip-first-page-jump-to'})
}}},
};
</script>
<style lang="scss" scoped>
@import '~@/style/helper/vars';
// 发送验证码按钮
.abs-button {
  width: 126px;
  height: 44px;
  display: inline-block;
  // position: absolute;
  color: $brand-1;
  background: white;
  border-radius: 2px;
  line-height: 44px;
  text-align: center;
  border: 1px solid $brand-1;
  top: 15px;
  right: 30px;

  &:hover {
    background-color: lighten($brand-1, 60%);
  }
}

// 上传企业征信查询授权书----模板
.report-alink{
    position: absolute;
    margin-left: 150px;
    margin-top: 8px;
    color: #4A90E2;
}

.hr30 {
  height: 30px;
}
.hr20 {
  height: 20px;
}
.row {
  label {
    color: #4a4a4a;
    font-size: 14px;
    // font-weight: bold;
    display: block;
    line-height: 36px;
  }
  .err {
    display: none;
  }
  &.error .err {
    display: block;
  }
}

/* error 错误提示 */
.error {
  input.cf-input,
  select {
    border-color: #c33;
  }
  .err {
    color: #c33;
    position: absolute;
    margin-left: 698px;
    margin-top: -33px;
  }
}

/* tips */
.tips {
  line-height: 36px;
  font-size: 14px;
  color: #9b9b9b;
  i {
    color: white;
    text-align: center;
    line-height: 18px;
    font-size: 14px;
    font-style: normal;
    display: inline-block;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: #1f8be8;
    margin-right: 6px;
  }
}

/* 添加复核人按钮 add-check-btn */
.add-check-btn {
  display: block;
  width: 337px;
  height: 57px;
  line-height: 57px;
  border: 1px solid #4a90e2;
  color: #4a90e2;
  text-align: center;
}

/* 返回上一步， 下一步 */
.prev-btn {
  width: 146px;
  height: 48px;
  line-height: 28px;
  color: #39a884;
  border: 1px solid #39a884;
}

.next-btn {
  // color:white;
  // background-color: #1f8be8;
  // border: none;
}

.cf-input--long {
  width: 686px;
}

input[type='radio'] {
  vertical-align: -2px;
  margin-right: 5px;
}
h3{
  line-height: 34px;
  font-weight: normal;
}
</style>
<style>
.page-wrap:after{
    content: "";
    display: block;
    height: 40px;
}

/* 省市 */
.province-city select:first-child {
  width: 300px;
  margin-right: 20px;
}

.province-city select:last-child {
  width: 300px;
}

.province-city > div:first-child input {
  width: 340px;
}
.province-city > div:last-child input {
  width: 340px;
}
select {
  width: 686px;
}

/* nav-bar */
.nav-bar {
  margin: 42px;
}

.line {
  height: 1px;
  background-color: #e4e4e4;
  display: flex;
  justify-content: space-between;
  width: 86%; /* 供应商注册最上方有5个tab，为了适配一屏，宽度改小点 */
  margin: auto;
}

.dot {
  color: #999;
  width: 1px;
}

.dot span {
  display: block;
  white-space: nowrap;
}

.dot span:first-child {
  height: 36px;
  width: 36px;
  background-color: #e4e4e4;
  border-radius: 50%;
  margin-top: -18px;
  color: white;
  text-align: center;
  line-height: 24px;
  border: 6px solid white;
}

.dot span:last-child {
  padding-top: 6px;
  margin-left: -28px;
}

.dot.active span:first-child {
  background-color: #38a884;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAICAYAAAAvOAWIAAAAAXNSR0IArs4c6QAAAFNJREFUGBljYCAC/P//PxiILxNUClQUAsTfQBrwKsZQCBSYD8Ra6LowFIIUAAXbgPgFsgasCmGmASW7oBo08SpE0/AGqJiwZ6BOKgUq9oEZgE4DAEogbVckKgYWAAAAAElFTkSuQmCC);
  background-repeat: no-repeat;
  background-position: 7px 8px;
  color: transparent;
  transition: background-color 0.3s;
}

.dot.curr span:first-child {
  background-color: #38a884;
  color: #fff;
}
.dot.active span, .dot.curr span {
  color: #38a884;
}
.line li:last-child span:last-child {
  margin-left: -5px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
