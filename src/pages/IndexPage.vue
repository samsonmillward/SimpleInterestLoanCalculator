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
                        (val !== null && val !== '' && val >= 0) ||
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
                            'Please type an interest rate between 0 and 100',
                    ]" />

                <q-input filled v-model="userInput.marginInterestRateInput" type="number" label="Margin rate input"
                    min="0" max="100" outlined suffix="%" :rules="[
                        (val) =>
                            (val !== null && val !== '' && val <= 100 && val >= 0) ||
                            'Please type a margin rate between 0 and 100',
                    ]" />
                <q-btn class="submit-button" color="primary" label="Calculate" :disable="submitButtonDisabled"
                    type="submit" />
            </form>
        </div>
        <output-table :outputData="outputData" @edit-data="editData" />
    </div>
</template>

<script>

import OutputTable from 'src/components/OutputTable.vue';
export default {
    data() {
        return {
            userInput: {
                startDateInput: null,
                endDateInput: null,
                loanAmountInput: 0,
                currencyInput: '',
                interestRateInput: 0,
                marginInterestRateInput: 0
            },
            currencies: ['GBP', 'USD', 'EUR'],
            outputData: [],
            cumulativeInterest: 0,
            pagination: { rowsPerPage: 20 },
        }
    },
    components: {
        OutputTable
    },
    computed: {
        // Disable the submit button if any of the input fields are empty
        submitButtonDisabled() {
            return Object.values(this.userInput).some(value => value === null || value === '');
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
        // Take the string containing the currency symbol and the value and return the value with two decimal places
        formatCurrencyToTwoDecimalPlaces(value) {
            let currencySymbol = value[0]
            let valueWithoutCurrencySymbol = value.slice(1);
            return currencySymbol + ' ' + parseFloat(valueWithoutCurrencySymbol).toFixed(2);
        },
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
            // Principal loan amount * (Interest Rate / 100) * (Loan Period / 365) / 365 to get daily interest,
            // assuming interest is charged yearly
            return +((this.userInput.loanAmountInput * (this.userInput.interestRateInput / 100) * (this.loanPeriod() / 365)) / 365);
        },
        // Principal loan amount * ((Interest Rate + Margin Rate) / 100) * (Loan Period / 365) / 365  to get daily interest including margin
        dailyInterestInclMargin() {
            return +((this.userInput.loanAmountInput * ((+this.userInput.interestRateInput + +this.userInput.marginInterestRateInput) / 100) * (this.loanPeriod() / 365)) / 365);

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
            for (let i = 0; i < this.loanPeriod() + 1; i++) {
                let dailyStats = {
                    dailyInterestNoMargin: this.getCurrencySymbol(this.userInput.currencyInput) + ' ' + this.getDailyInterestNoMargin(),
                    totalInterestAmountAccrued: this.getCurrencySymbol(this.userInput.currencyInput) + ' ' + this.dailyInterestInclMargin(),
                    date: this.calculateDate(i),
                    daysPassed: i,
                    totalInterest: this.getCurrencySymbol(this.userInput.currencyInput) + ' ' + +(this.cumulativeInterest += this.dailyInterestInclMargin()),
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
