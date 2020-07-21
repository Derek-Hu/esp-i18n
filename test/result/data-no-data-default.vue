<template>
  <section class="guide-wrap-section">
    <p>{{Labels.shifttoanearlierdatePrepareAsfollowsSothat}}</p>
    <p>
      {{Labels.well1}}
    </p>
  </section>
</template>

<script>
import { formatMessage } from '~/locale-tools';

export default {
	data(){
		return {
			 Labels: {
  "shifttoanearlierdatePrepareAsfollowsSothat": formatMessage({id: 'shifttoanearlierdate-prepare-asfollows-sothat'}),
  "well1": formatMessage({id: 'well-1'})
}
			}
		}
	};
</script>
