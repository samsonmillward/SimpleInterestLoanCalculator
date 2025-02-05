<template>
    <div v-if="outputData.length > 0" class="container-output">
        <div v-for="data in this.outputData" :key="data" class="output-tables">
            <q-table :rows="data.output" :columns="columns" :pagination="pagination">
                <template v-slot:top>
                    <q-toolbar>
                        <h2>Details for the {{ getCurrencySymbol(data.input.currencyInput) }}{{
                            data.input.loanAmountInput }} loan starting on the {{
                                data.input.startDateInput }} and ending on the {{ data.input.endDateInput }}, with {{
                                data.input.interestRateInput }}% base interest and {{ data.input.marginInterestRateInput
                            }}%
                            margin interest</h2>
                        <q-space />
                        <q-btn round icon="edit" @click="editData(data)">
                            <q-tooltip>Edit data</q-tooltip>
                        </q-btn>
                    </q-toolbar>
                </template>
            </q-table>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        outputData: {
            type: Array,
            required: true
        }
    },
    emits: ['edit-data'],
    data() {
        return {
            pagination: { rowsPerPage: 20 },
        }
    },
    computed: {
        columns() {
            return [
                {
                    name: 'date',
                    label: 'Date',
                    align: 'left',
                    field: 'date',
                    format: (val) => val,
                },
                {
                    name: 'daysPassed',
                    label: 'Days Passed Since Loan Start',
                    align: 'left',
                    field: 'daysPassed',
                    format: (val) => val,
                },
                {
                    name: 'dailyInterestNoMargin',
                    label: 'Daily Interest',
                    align: 'left',
                    field: 'dailyInterestNoMargin',
                    format: (val) => this.formatCurrencyToTwoDecimalPlaces(val),
                },
                {
                    name: 'totalInterestAmountAccrued',
                    label: 'Total Daily Interest Including Margin',
                    align: 'left',
                    field: 'totalInterestAmountAccrued',
                    format: (val) => this.formatCurrencyToTwoDecimalPlaces(val),
                },
                {
                    name: 'totalInterest',
                    label: 'Total Interest',
                    align: 'left',
                    field: 'totalInterest',
                    format: (val) => this.formatCurrencyToTwoDecimalPlaces(val),
                },
            ]
        },
    },
    methods: {
        editData(data) {
            this.$emit('edit-data', data);
        },
        getCurrencySymbol(currencyInput) {
            const currencySymbols = {
                GBP: '£',
                USD: '$',
                EUR: '€',
            };
            return currencySymbols[currencyInput];
        },
        // Take the string containing the currency symbol and the value and return the value with two decimal places
        formatCurrencyToTwoDecimalPlaces(value) {
            let currencySymbol = value[0]
            let valueWithoutCurrencySymbol = value.slice(1);
            return currencySymbol + ' ' + parseFloat(valueWithoutCurrencySymbol).toFixed(2);
        },
    }
}
</script>