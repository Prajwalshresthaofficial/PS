function taxCalculator() {
    return {
        qty: '',
        buyPrice: '',
        faceValue: '',
        shareType: 'IPO',
        mode: 'sell',
        holding: 'long',

        clearFields() {
            this.qty = '';
            this.buyPrice = '';
            this.faceValue = '';
            this.faceValue = '';
        },

        customRound(num) {
            if (isNaN(num) || num === null || num === 0) return "0.00";

            const str = num.toString();

            if (!str.includes('.')) return num.toFixed(2);

            const [intPart, decPart] = str.split('.');

            if (decPart.length >= 3) {
                const thirdDigit = parseInt(decPart[2]);

                if (thirdDigit > 5) {
                    return (Math.round(num * 100) / 100).toFixed(2);
                } else {
                    return (Math.floor(num * 100) / 100).toFixed(2);
                }
            }

            return num.toFixed(2);
        },


        get results() {

            const sebonRate = 0.00015;
            const dpFee = 25;
            const minBrokerComm = 10;


            const getComm = (amount) => {

                if (amount === 0) return 0;

                let rate = amount <= 50000 ? 0.0036 :
                           amount <= 500000 ? 0.0033 :
                           amount <= 2000000 ? 0.00306 :
                           amount <= 10000000 ? 0.0027 :
                           0.00243;

                return Math.max(amount * rate, minBrokerComm);
            };


            // ================= BUY SIDE =================

            const effectiveBuyPrice = (this.shareType === 'Right' || this.shareType === 'Bonus')
                ? (this.faceValue || this.buyPrice || 0)
                : (this.buyPrice || 0);

            const buyAmt = (this.qty || 0) * effectiveBuyPrice;

            let bComm = 0;
            let bSebon = 0;
            let totalBuy = buyAmt;


            // Only Secondary market includes buying charges
            if (this.shareType === 'Secondary' && buyAmt > 0) {

                bComm = getComm(buyAmt);
                bSebon = buyAmt * sebonRate;

                totalBuy = buyAmt + bComm + bSebon + dpFee;

            }

            const hasValidInput = (this.qty > 0 && this.buyPrice > 0);

            return {

                buyComm: this.customRound(bComm),

                buySebon: this.customRound(bSebon),

                wacc: this.customRound(totalBuy),

                dp: (hasValidInput && this.shareType === 'Secondary') ? "25.00" : "0.00"
            };
        }
    }
}
