<template>
  <cf-panel :title="breadcrumbData" >
    <div class="pad-10">
      <div class="nav-bar">
        <ul class="line">
          <li v-for="(item, index) in dotArr" :class="{dot:1, active: nowStep>index}" ><span>{{index+1}}</span><span>{{item}}</span></li>
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
            :title="'营业执照'"
            :size="idCardSize"
            :ocrUrl="'/matrix/ocr-recognition'"
            @ocrSuccess="ocrSuccessStep0LicenceOssId"
            @ossSuccess="(data)=>(this.step0.licenceOssId = data.key)"
          ></cf-upload>
          <cf-upload
            ref="step0ContractId"
            :id="'step0ContractId'"
            :acceptType="['image', 'pdf']"
            :title="'合作合同'"
            @ossSuccess="(data)=>(this.step0.contractId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>公司全称</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.companyName" placeholder="上传营业执照后自动读取/手动填写" maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>统一社会信用代码</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.usci" placeholder="上传营业执照后自动读取/手动填写" maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>公司电话</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.companyTel" placeholder="请填写公司电话" maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>公司地址</label>
          <div class="province-city" id="address" v-bind:data-province="step0.companyAddressProvince" v-bind:data-city="step0.companyAddressCity"></div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <div class="" style="padding-top:14px;" >
            <input type="text" v-model.trim="step0.companyAddress" placeholder="公司详细地址" class="cf-input cf-input--long" id="" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>法定代表人姓名</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step0.legalPersonName" placeholder="上传营业执照后自动读取/手动填写"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>成立日期</label>
          <div>
            <cf-datepicker :width="'686px'" @pick="pickFoundDate" :value="foundDate" ></cf-datepicker>
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>营业到期日</label>
          <div>
            <label for="r1" ><input type="radio" @change="changePeriod" name="business" id="r1" value="长期" :checked="is_long_period" >长期</label>
            <label for="r2" ><input type="radio" @change="changePeriod" name="business" id="r2" value="非长期" :checked="!is_long_period" >非长期</label>
            <div v-show="!is_long_period" >
              <div>
                <cf-datepicker :width="'686px'"  @pick="pickDueDate" :value="dueDate" ></cf-datepicker>
              </div>
              <div class="err">{{errMsg}}</div>
            </div>
          </div>
        </div>
        <div class="row">
          <cf-upload
            ref="step0companyCreditReportId"
            :id="'step0companyCreditReportId'"
            :acceptType="['image', 'pdf']"
            :title="'企业征信报告(选填)'"
            @ossSuccess="(data)=>(this.step0.companyCreditReportId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <button type="button"  class="cf-button cf-button--primary next-btn" @click.prevent="check_step0" >下一步</button>
        </div>
      </div>
      <!-- 银行账户信息 -->
      <div id="J_Company_Step1"  :style="{display:nowStep==2?'block':'none'}"  >
        <div>
          <label>企业名称</label>
          <div>{{step0.companyName}}</div>
        </div>
        <div class="row">
          <label>银行账号</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step1.bankAccount" placeholder="请输入银行账号"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>所属银行</label>
          <div class="cf-input--long">
            <cf-dropdown
              :placeholder="'请选择'"
              :data="allBanks"
              :width="'100%'"
              @change="changeBank"
              >
            </cf-dropdown>
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>开户省市</label>
          <div class="province-city" id="addressBank" v-bind:data-province="step1.branchBankProvince" v-bind:data-city="step1.branchBankCity"></div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>开户支行</label>
          <div>
            <input type="text" v-model.trim="step1.branchBankName" placeholder="请输入支行名称" class="cf-input cf-input--long" id=""  maxlength="50">
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <div>
            <a class="cf-button  prev-btn" @click.prevent="prev_step" ref="step2" target="_blank">返回上一步</a>
            <a class="cf-button cf-button--primary next-btn" @click.prevent="check_step1" target="_blank">下一步</a>
          </div>
        </div>
      </div>
      <!-- 法定代表人信息 -->
      <div id="J_Company_Step2" :style="{display:nowStep==3?'block':'none'}" >
        <div class="">
          <label>法定代表人姓名</label>
          <div class="">
            {{step0.legalPersonName}}
          </div>
        </div>
        <div class="row">
          <cf-upload
            ref="step2LicenceOssId1"
            :id="'step2LicenceOssId1'"
            :acceptType="'image'"
            :size="idCardSize"
            :title="'法定代表人身份证'"
            :inTitle="'身份证照片面'"
            :ocrUrl="'/matrix/idcard-recognition'"
            @ocrSuccess="ocrSuccessStep2LicenceOssId1"
            @ossSuccess="(data)=>(this.step2.legalPersonFrontOssId = data.key)"
          ></cf-upload>
          <span style="padding-top:20px;display:inline-block;" >
            <cf-upload
              ref="step2LicenceOssId2"
              :id="'step2LicenceOssId2'"
              :acceptType="'image'"
              :size="idCardSize"
              :title="''"
              :inTitle="'身份证国徽面'"
              @ossSuccess="(data)=>(this.step2.legalPersonBackOssId = data.key)"
            ></cf-upload>
          </span>
        </div>
        <div class="row">
          <label>法定代表人身份证号</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step2.legalPersonId" placeholder="上传身份证后自动读取/手动填写"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>法定代表人邮箱(选填)</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model.trim="step2.legalPersonEmail" placeholder="请输入法定代表人邮箱"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>法定代表人手机号码(选填)</label>
          <div>
            <input type="number" v-integer class="cf-input cf-input--long" v-model.trim="step2.legalPersonPhone" placeholder="请输入法定代表人手机号码"  maxlength="50" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <cf-upload
            ref="step2LicenceOssId3"
            :id="'step2LicenceOssId3'"
            :acceptType="['image', 'pdf']"
            :title="'央行征信报告(选填)'"
            :inTitle="'央行征信报告'"
            @ossSuccess="(data)=>(this.step2.legalPersonCreditReportOssId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <div>
            <a class="cf-button prev-btn"  @click.prevent="prev_step" ref="step3"  target="_blank">返回上一步</a>
            <a class="cf-button cf-button--primary next-btn" @click.prevent="check_step2" target="_blank">下一步</a>
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
            :title="'经办人身份证照片面'"
            :ocrUrl="'/matrix/idcard-recognition'"
            @ocrSuccess="ocrSuccessStep3LicenceOssOperatorId1"
            @ossSuccess="(data)=>(this.step3.operator.idFrontOssId = data.key)"
          ></cf-upload>
          <cf-upload
            ref="step3LicenceOssOperatorId2"
            :id="'step3LicenceOssOperatorId2'"
            :acceptType="'image'"
            :size="idCardSize"
            :title="'经办人身份证国徽面'"
            @ossSuccess="(data)=>(this.step3.operator.idBackOssId = data.key)"
          ></cf-upload>
        </div>
        <div class="row">
          <label>经办人姓名</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step3.operator.name" placeholder=" 上传身份证后自动读取/手动填写" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>经办人身份证号</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step3.operator.idNo" placeholder=" 上传身份证后自动读取/手动填写" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>经办人邮箱</label>
          <div>
            <input type="text" class="cf-input cf-input--long" v-model="step3.operator.email" ref="operator_email" placeholder=" 将用于经办人企业平台登录" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <label>经办人手机号码</label>
          <div>
            <input type="number" v-integer class="cf-input cf-input--long" v-model="step3.operator.phone" ref="operator_tel" placeholder=" 请输入经办人手机号码" >
          </div>
          <div class="err">{{errMsg}}</div>
        </div>
        <div class="row">
          <cf-upload
            ref="step3LicenceOssOperatorId3"
            :id="'step3LicenceOssOperatorId3'"
            :acceptType="['image', 'pdf']"
            :title="'授权委托书'"
            @ossSuccess="(data)=>(this.step3.operator.authorizationOssId = data.key)"
          ></cf-upload>
        </div>
        <!-- 添加复核人 -->
        <div class="row">
          <div class="hr20"></div>
          <!-- <a class="add-check-btn" :style="{display: add_check_btn?'none':'block'}" @click.prevent="addCheckPerson" > -->
          <a class="add-check-btn" style="display:none;" @click.prevent="addCheckPerson" >
            <span style="font-size:30px;vertical-align:middle;padding-right:6px;" >+</span>
            <span style="vertical-align:middle;" >添加复核人信息(选填)</span>
          </a>
          <div :style="{display: add_check_btn?'block':'none'}" >
            <div class="row">
              <cf-upload
                ref="step3LicenceOssCheckerId1"
                :id="'step3LicenceOssCheckerId1'"
                :acceptType="'image'"
                :size="idCardSize"
                :title="'复核人身份证照片面(选填)'"
                :inTitle="'复核人身份证照片面'"
                :ocrUrl="'/matrix/idcard-recognition'"
                @ocrSuccess="ocrSuccessStep3LicenceOssCheckerId1"
                @ossSuccess="(data)=>(this.step3.checker.idFrontOssId = data.key)"
              ></cf-upload>
              <cf-upload
                ref="step3LicenceOssCheckerId2"
                :id="'step3LicenceOssCheckerId2'"
                :acceptType="'image'"
                :size="idCardSize"
                :title="'复核人身份证国徽面(选填)'"
                :inTitle="'复核人身份证国徽面'"
                @ossSuccess="(data)=>(this.step3.checker.idBackOssId = data.key)"
              ></cf-upload>
            </div>
            <div class="in-row">
              <label>复核人姓名(选填)</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.name" placeholder=" 上传身份证后自动读取/手动填写" >
              </div>
            </div>
            <div class="in-row">
              <label>复核人身份证号(选填)</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.idNo" placeholder=" 上传身份证后自动读取/手动填写" >
              </div>
            </div>
            <div class="in-row">
              <label>复核人邮箱(选填)</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.email" placeholder=" 将用于经办人企业平台登录" >
              </div>
            </div>
            <div class="in-row">
              <label>复核人手机号码(选填)</label>
              <div>
                <input type="text" class="cf-input cf-input--long" v-model="step3.checker.phone" placeholder=" 请输入复核人手机号码" >
              </div>
            </div>
            <div class="row">
              <cf-upload
                ref="step3LicenceOssCheckerId3"
                :id="'step3LicenceOssCheckerId3'"
                :acceptType="'image'"
                :title="'授权委托书(选填)'"
                :inTitle="'授权委托书'"
                @ossSuccess="(data)=>(this.step3.checker.authorizationOssId = data.key)"
              ></cf-upload>
            </div>
          </div>
        </div>
        <div class="row">
          <label>&nbsp;</label>
          <div>
            <a class="cf-button prev-btn"  @click.prevent="prev_step" ref="step4"  target="_blank">返回上一步</a>
            <a class="cf-button cf-button--primary next-btn" target="_blank" @click.prevent="check_step3" >立即提交</a>
          </div>
        </div>
      </div>
    </div>
    <cf-modal :show.sync="pop.ModalVisible" :hideFooter='false' :size="'sm'" :maxLimit="false">
      <div slot="title">{{pop.title}}</div>
      <section class="pad-h-20 pad-t-20 pad-b-50">
        <div class="cf-inline cf-inline--wide" v-html="pop.body" ></div>
      </section>
      <div slot="footer">
        <button type="button" :style="{'background':pop.ok?'white':'#00bc8d'}" class="cf-button cf-button--default cf-button--xs mar-r-10" @click="pop.ModalVisible=false" >{{pop.cancel}}</button>
        <button type="button" v-show="pop.ok"  class="cf-button cf-button--primary cf-button--sm" @click.prevent="goToList()"  >{{pop.ok}}</button>
      </div>
    </cf-modal>
    <cf-modal :show.sync="submitVisible" :hideFooter='true'>
      <div slot="title" ><span id="J_FundBack" ></span></div>
      <section style="text-align:center;">
        <div style="text-align:center; font-size:16px;"><b id="J-flow-second" >3</b>秒后跳转到资金方列表页</div>
      </section>
    </cf-modal>
  </cf-panel>
</template>
<script>import { formatMessage } from '~/locale-tools';

/* eslint-disable */
// import axios from 'axios';
import api from '@api';
import Reg from '@helper/verify';
import ProvinceCity from '@helper/district';
import beforeunload from '@helper/beforeunloadalert';
// oss 客户端js
import { UPLOAD_SIZE_IDCARD } from '@helper/const';
let pdfUrl = require('@/assets/pdf.png');
import Vue from 'vue';

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
  breadcrumbData: [{ name: formatMessage({id: 'company-management'}), link: 'funder' }, { name: formatMessage({id: 'create-fund-side'}) }],
  nowStep: 1,
  dotArr: [formatMessage({id: 'basic-information-of-enterprise'}), formatMessage({id: 'bank-account-information'}), formatMessage({id: 'information-of-legal-representative'}), formatMessage({id: 'agent'})],
  idCardSize: UPLOAD_SIZE_IDCARD,
  errMsg: '',
  add_check_btn: false,
  is_long_period: true, // 是否长期的
  allBanks: [],
  submitVisible: false,
  foundDate: Vue.filter('formatDate')(Date.now()),
  dueDate: Vue.filter('formatDate')(Date.now()),
  legalName: '', // 法定代表人姓名
  pop: {
    title: '',
    ModalVisible: false,
    body: formatMessage({id: 'legal-representative-status-business-license-atypism'}),
    ok: formatMessage({id: 'view-enterprise'}),
    cancel: formatMessage({id: 'cancel'}),
  },
  step0: {
    companyId: '',
    licenceOssId: '',
    contractId: '',
    companyName: '',
    usci: '',
    companyTel:'',
    companyAddressProvince: '',
    companyAddressCity: '',
    companyAddress: '',
    legalPersonName: '',
    foundDate: '',
    dueDate: '',
    longTermFlag: '',
    companyCreditReportId: '',
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
  },
  step3: {
    operator: {
      idFrontOssId: '',
      idBackOssId: '',
      name: '',
      idNo: '',
      email: '',
      phone: '',
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
    VueData.nowStep = 1;
    VueData.pop.ModalVisible = false;

    // 获取银行列表 -- 第二步
    const bankRes = await api.allBanks();
    const bankList = bankRes.data.content || [];
    this.allBanks = bankList.map(bank => ({
      value: bank.id,
      name: bank.name,
    }));

    VueData.submitVisible = false;
    // 看是否是创建还是编辑
    if (!this.$route.query.id) {
      // 新创建
      document.getElementById('J_FundBack').innerHTML = formatMessage({id: 'fund-side-created-successfully'});
      this.breadcrumbData[1].name = formatMessage({id: 'create-fund-side'});
      VueData.is_long_period = true;
      VueData.foundDate = Vue.filter('formatDate')(Date.now());

      VueData.step0 = {
        companyId: '',
        licenceOssId: '',
        contractId: '',
        companyName: '',
        usci: '',
        companyTel:'',
        companyAddressProvince: '',
        companyAddressCity: '',
        companyAddress: '',
        legalPersonName: '',
        foundDate: '',
        dueDate: '',
        longTermFlag: '',
        companyCreditReportId: '',
      };

      VueData.step1 = {
        bankAccount: '',
        bankId: '',
        branchBankProvince: '',
        branchBankCity: '',
        branchBankName: '',
      };

      VueData.step2 = {
        legalPersonFrontOssId: '',
        legalPersonBackOssId: '',
        legalPersonId: '',
        legalPersonEmail: '',
        legalPersonPhone: '',
        legalPersonCreditReportOssId: '',
      };

      VueData.step3 = {
        operator: {
          idFrontOssId: '',
          idBackOssId: '',
          name: '',
          idNo: '',
          email: '',
          phone: '',
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
      };
    } else {
      // 编辑
      document.getElementById('J_FundBack').innerHTML = formatMessage({id: 'fund-side-modified-successfully'});

      let data = (await api.getFunderDetailById(this.$route.query.id)).data;

      if (data.result != 'success') {
        this.$store.dispatch('setNotifierState', {
          show: true,
          text: formatMessage({id: 'gain-fund-there-is'}),
          duration: 1500,
        });
        return;
      }

      this.breadcrumbData[1].name = formatMessage({id: 'modify-funding-party'});

      VueData.step0 = {
        companyId: data.content.companyVO.id,
        licenceOssId: data.content.companyVO.licenceOssId,
        contractId: data.content.companyVO.contractId,
        companyName: data.content.companyVO.companyName,
        usci: data.content.companyVO.usci,
        companyTel:data.content.companyVO.companyTel,
        companyAddressProvince: data.content.companyVO.companyAddressProvince,
        companyAddressCity: data.content.companyVO.companyAddressCity,
        companyAddress: data.content.companyVO.companyAddress,
        legalPersonName: data.content.companyVO.legalPersonName,
        foundDate: data.content.companyVO.foundDate,
        dueDate: data.content.companyVO.dueDate,
        longTermFlag: data.content.companyVO.longTermFlag,
        companyCreditReportId: data.content.companyVO.companyCreditReportId,
      };
      VueData.step1 = {
        bankAccount: data.content.companyVO.bankAccount,
        bankId: data.content.companyVO.bankId,
        branchBankProvince: data.content.companyVO.branchBankProvince,
        branchBankCity: data.content.companyVO.branchBankCity,
        branchBankName: data.content.companyVO.branchBankName,
      };
      VueData.step2 = {
        legalPersonFrontOssId: data.content.companyVO.legalPersonFrontOssId,
        legalPersonBackOssId: data.content.companyVO.legalPersonBackOssId,
        legalPersonId: data.content.companyVO.legalPersonId,
        legalPersonEmail: data.content.companyVO.legalPersonEmail,
        legalPersonPhone: data.content.companyVO.legalPersonPhone,
        legalPersonCreditReportOssId: data.content.companyVO.legalPersonCreditReportOssId,
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

      // 选择的银行
      if (data.content.companyVO.bankId) {
        this.allBanks = this.allBanks.map(obj => {
          if (obj.value == data.content.companyVO.bankId) {
            obj.selected = true;
          }
          return obj;
        });
      }

      // 营业期限
      if (data.content.companyVO.longTermFlag) {
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
      this.foundDate = VueData.step0.foundDate.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1/$2/$3');

      // 第一步(营业执照和合作合同)
      (() => {
        const { licenceOssId, contractId, companyCreditReportId } = VueData.step0;
        licenceOssId && this.$refs.step0LicenceOssId.showPic(false, { key: licenceOssId });
        contractId && this.$refs.step0ContractId.showPic(false, { key: contractId });
        companyCreditReportId && this.$refs.step0companyCreditReportId.showPic(false, { key: companyCreditReportId });
      })();

      // 第三步(法定代表人身份证和法定代表人个人征信报告)
      (() => {
        const { legalPersonFrontOssId, legalPersonBackOssId, legalPersonCreditReportOssId } = VueData.step2;
        legalPersonFrontOssId && this.$refs.step2LicenceOssId1.showPic(false, { key: legalPersonFrontOssId });
        legalPersonBackOssId && this.$refs.step2LicenceOssId2.showPic(false, { key: legalPersonBackOssId });

        legalPersonCreditReportOssId &&
          this.$refs.step2LicenceOssId3.showPic(false, { key: legalPersonCreditReportOssId });
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

      // 未激活的编辑情况下， 经办人邮箱 手机不能编辑
      if (data.content.operator.activated) {
        this.$refs.operator_email.disabled = true;
        this.$refs.operator_tel.disabled = true;
      } else {
        this.$refs.operator_email.disabled = false;
        this.$refs.operator_tel.disabled = false;
      }
    }

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
    if (!isNormalGo) {
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

  methods: {
    goToList() {
      this.$router.push({
        name: 'company',
        query: {},
      });
    },

    changeBank(val) {
      this.step1.bankId = val.value;
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

    async check_step0() {
      if (!this.step0.licenceOssId) {
        this.$refs.step0LicenceOssId.showErrorMsg(formatMessage({id: 'please-upload-business-license'}));
        return false;
      }

      // 上传合同
      if (!this.step0.contractId) {
        this.$refs.step0ContractId.showErrorMsg(formatMessage({id: 'please-upload-the-contract'}));
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

      if( !Reg.phone(this.step0.companyTel) ){
        goToErr('J_Company_Step0', 3);
        this.errMsg = formatMessage({id: 'corporation-telephone-incorrect-figure'});
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

      // 可以到下一步了
      let data;

      try {
        data = (await api.createStepOneFunder(this.step0)).data;
      } catch (e) {
        if (e.errorCode == '1010') {
          this.pop.title = formatMessage({id: 'the-enterprise-already-exists'});
          this.pop.ModalVisible = true;
          (this.pop.body = `${formatMessage({id: 'unify-society-trustworthiness-code-1'})}`), (this.pop.ok = formatMessage({id: 'view-enterprise'}));
          this.pop.cancel = formatMessage({id: 'cancel'});
          return;
        }
      }

      if (data.result == 'success') {
        this.step0.companyId = data.content;
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
        this.errMsg = formatMessage({id: 'please-select-a-bank'});
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

      try {
        // 可以到下一步了
        let data = (await api.createStepTwoFunder({ ...this.step1, companyId: this.step0.companyId })).data;

        if (data.result == 'success') {
          this.nowStep = 3;
          document.documentElement.scrollTop = document.body.scrollTop = 0;
        }
      } catch (e) {
        this.pop.title = formatMessage({id: 'error'});
        this.pop.ModalVisible = true;
        (this.pop.body = e.errorMsg), (this.pop.ok = formatMessage({id: 'determine'}));
        this.pop.cancel = formatMessage({id: 'cancel'});
        return;
      }
    },
    async check_step2() {
      // 身份证姓名与法定代表人姓名对比
      if (this.legalName) {
        if (this.legalName != this.step0.legalPersonName) {
          this.pop.title = formatMessage({id: 'legal-representative-information-atypism-inconsistent'});
          this.pop.ModalVisible = true;
          (this.pop.body = `${formatMessage({id: 'legal-representative-status-business-license-atypism'})}`),
            (this.pop.ok = '');
          this.pop.cancel = formatMessage({id: 'confirm'});
          return false;
        }

        // 法定代表人身份证照片面
        if (!this.step2.legalPersonFrontOssId) {
          this.$refs.step2LicenceOssId1.showErrorMsg(formatMessage({id: 'upload-legal-representative-identity-card-photograph'}));
          return false;
        }
      }


      if (this.step2.legalPersonId) {
        if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.step2.legalPersonId)) {
          goToErr('J_Company_Step2', 1);
          this.errMsg = formatMessage({id: 'id-form-incorrect-format'});
          return false;
        }
      }

      // 邮箱
      // if( this.step2.legalPersonEmail ){
      //
      // }else{
      //   goToErr('J_Company_Step2', 2 );
      //   this.errMsg = '请填写邮箱号';
      //   return false;
      // }

      if (this.step2.legalPersonEmail) {
        // /^[-.\w]+@([\w-]+\.)+[\w-]{2,20}$/
        if (!/^[-.\w]+@([\w-]+\.)+[\w-]{2,20}$/.test(this.step2.legalPersonEmail)) {
          goToErr('J_Company_Step2', 2);
          this.errMsg = formatMessage({id: 'email-format-error'});
          return false;
        }
      }

      // 手机
      // if (this.step2.legalPersonPhone) {
      // } else {
      //   goToErr('J_Company_Step2', 3);
      //   this.errMsg = '请填写手机';
      //   return false;
      // }

      if( this.step2.legalPersonPhone ){
        if (!/^\d{11}$/.test(this.step2.legalPersonPhone)) {
          goToErr('J_Company_Step2', 3);
          this.errMsg = formatMessage({id: 'handset-form-mobile-number-mobile'});
          return false;
        }
      }

      try {
        // 可以到下一步了
        let data = (await api.createStepThreeFunder({ ...this.step2, companyId: this.step0.companyId })).data;

        if (data.result == 'success') {
          this.nowStep = 4;
          document.documentElement.scrollTop = document.body.scrollTop = 0;
        }
      } catch (e) {
        this.pop.title = formatMessage({id: 'error'});
        this.pop.ModalVisible = true;
        (this.pop.body = e.errorMsg), (this.pop.ok = formatMessage({id: 'determine'}));
        this.pop.cancel = formatMessage({id: 'cancel'});
        return;
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

      // 邮箱
      if (this.step3.operator.email) {
      } else {
        goToErr('J_Company_Step3', 3);
        this.errMsg = formatMessage({id: 'fill-in-postbox-please-fill'});
        return false;
      }

      // /^[-.\w]+@([\w-]+\.)+[\w-]{2,20}$/
      if (!/^[-.\w]+@([\w-]+\.)+[\w-]{2,20}$/.test(this.step3.operator.email)) {
        goToErr('J_Company_Step3', 3);
        this.errMsg = formatMessage({id: 'email-format-error'});
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
        let data = (await api.createStepFourFunder(submitData)).data;

        if (data.result == 'success') {
          this.submitVisible = true;
          await FlowSecond(document.getElementById('J-flow-second'), 3);
          isNormalGo = true;
          this.$router.push({
            name: 'funder',
          });
        }
      } catch (e) {
        this.pop.title = formatMessage({id: 'submit-failed'});
        this.pop.ModalVisible = true;
        (this.pop.body = e.errorMsg), (this.pop.ok = '');
        this.pop.cancel = formatMessage({id: 'confirm'});
        return;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
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
    background-color: #fcedef;
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
input[disabled] {
  background: #e4e4e4;
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
  width: 90%;
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
  color: white;
}

.dot.active span, .dot.active span {
  color: #38a884;
}

.line li:last-child span:last-child {
  margin-left: -5px;
}
</style>
