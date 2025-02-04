<template>
    <div class="column content-center container">
        <div class="container-input" id="input-container">
            <form @submit.prevent="calculateDailyInterest">
                <h1>A Simple Loan Calculator</h1>
                <q-input filled v-model="userInput.startDateInput" type="date" label="Start date" outlined :rules="[
                    (val) =>
                        (val !== null && val !== '') ||
                        'Please select a start date',
                ]" />
                <q-input filled v-model="userInput.endDateInput" type="date" label="End date" outlined :rules="[
                    (val) =>
                        (val !== null && val !== '') ||
                        'Please select an end date',
                ]" />
                <q-input filled v-model="userInput.loanAmountInput" type="number" label="Loan Amount" outlined :rules="[
                    (val) =>
                        (val !== null && val !== '' && val > 0) ||
                        'Please enter a loan amount',
                ]" />
                <q-select v-model="userInput.currencyInput" :options="currencies" label="Currency Select" :rules="[
                    (val) =>
                        (val !== null && val !== '') ||
                        'Please select a currency',
                ]" />
                <q-input filled v-model="userInput.interestRateInput" type="number" label="Base interest rate input"
                    min="0" max="100" outlined suffix="%" :rules="[
                        (val) =>
                            (val !== null && val !== '' && val <= 100 && val >= 0) ||
                            'Please type interest rate between 0 and 100',
                    ]" />

                <q-input filled v-model="userInput.marginInterestRateInput" type="number" label="Margin rate input"
                    min="0" max="100" outlined suffix="%" :rules="[
                        (val) =>
                            (val !== null && val !== '' && val <= 100 && val >= 0) ||
                            'Please type margin rate between 0 and 100',
                    ]" />
                <q-btn class="submit-button" color="primary" label="Calculate" :disable="submitButtonDisabled"
                    type="submit" />
            </form>

        </div>
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
    </div>

</template>

<script>

export default {
    data() {
        return {
            userInput: {
                startDateInput: null,
                endDateInput: null,
                loanAmountInput: null,
                currencyInput: null,
                interestRateInput: null,
                marginInterestRateInput: null
            },
            currencies: ['GBP', 'USD', 'EUR'],
            outputData: [],
            cumulativeInterest: 0,
            pagination: { rowsPerPage: 20 },
        }
    },
    computed: {
        submitButtonDisabled() {
            return !this.userInput.startDateInput || !this.userInput.endDateInput || !this.userInput.loanAmountInput || !this.userInput.currencyInput || !this.userInput.interestRateInput || !this.userInput.marginInterestRateInput;
        },

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
                    format: (val) => val,
                },
                {
                    name: 'totalInterestAmountAccrued',
                    label: 'Total Daily Interest Including Margin',
                    align: 'left',
                    field: 'totalInterestAmountAccrued',
                    format: (val) => val,
                },
                {
                    name: 'totalInterest',
                    label: 'Total Interest',
                    align: 'left',
                    field: 'totalInterest',
                    format: (val) => val,
                },
            ]
        },

    },
    methods: {
        // Convert the input dates to date objects from strings and calculate the difference in days.
        loanPeriod() {
            let startDateAsDate = new Date(this.userInput.startDateInput);
            let endDateAsDate = new Date(this.userInput.endDateInput);
            let differenceAsTime = endDateAsDate.getTime() - startDateAsDate.getTime();
            let differenceAsDays = Math.round(differenceAsTime / (1000 * 3600 * 24));

            return differenceAsDays;
        },
        getCurrencySymbol(currencyInput) {
            const currencySymbols = {
                GBP: '£',
                USD: '$',
                EUR: '€',
            };
            return currencySymbols[currencyInput];
        },
        // Fill the input fields with the data from the selected table and then scroll the inputs into view
        editData(data) {
            this.userInput.startDateInput = data.input.startDateInput;
            this.userInput.endDateInput = data.input.endDateInput;
            this.userInput.loanAmountInput = data.input.loanAmountInput;
            this.userInput.currencyInput = data.input.currencyInput;
            this.userInput.interestRateInput = data.input.interestRateInput;
            this.userInput.marginInterestRateInput = data.input.marginInterestRateInput;
            const inputContainer = document.getElementById('input-container');
            inputContainer.scrollIntoView({ behavior: 'smooth' });
        },
        getDailyInterestNoMargin() {
            // Principal loan amount * (Interest Rate / 100) / Loan Period to get daily interest,
            // assuming interest is charged for period of loan rather than yearly
            return +(this.userInput.loanAmountInput * ((this.userInput.interestRateInput / 100) / this.loanPeriod())).toFixed(2);
        },
        // Principal loan amount * ((Interest Rate + Margin Rate) / 100) / Loan Period to get daily interest including margin
        dailyInterestInclMargin() {
            return +(this.userInput.loanAmountInput * (((this.userInput.interestRateInput + this.userInput.marginInterestRateInput) / 100) / this.loanPeriod())).toFixed(2);

        },
        // Calculate the date based on the number of days passed since the loan start date
        calculateDate(days) {
            let result = new Date(this.userInput.startDateInput);
            result.setDate(result.getDate() + days);
            return result.toLocaleDateString();
        },
        calculateDailyInterest() {
            this.cumulativeInterest = 0;
            let temp = [];
            for (let i = 0; i < this.loanPeriod(); i++) {
                let dailyStats = {
                    dailyInterestNoMargin: this.getCurrencySymbol(this.userInput.currencyInput) + ' ' + this.getDailyInterestNoMargin(),
                    totalInterestAmountAccrued: this.getCurrencySymbol(this.userInput.currencyInput) + ' ' + this.dailyInterestInclMargin(),
                    date: this.calculateDate(i),
                    daysPassed: i + 1,
                    totalInterest: this.getCurrencySymbol(this.userInput.currencyInput) + ' ' + +((this.cumulativeInterest += (this.getDailyInterestNoMargin() + this.dailyInterestInclMargin()))).toFixed(2),
                }
                temp.push(dailyStats);
            }

            // Push both input and output to keep the original input data
            let dataToBePushed = {
                output: temp,
                input: JSON.parse(JSON.stringify(this.userInput))
            }
            this.outputData.unshift(dataToBePushed);
        }
    }
};
</script>
