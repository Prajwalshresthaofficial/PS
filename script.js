function taxCalculator() {
    return {
        mode: 'buy',
        qty: '',
        buyPrice: '',
        sellPrice: '',
        shareType: 'IPO',
        holding: 'long',

        clearFields() {
            this.qty = '';
            this.buyPrice = '';
            this.sellPrice = '';
            this.holding = 'long';
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

            const buyAmt = (this.qty || 0) * (this.buyPrice || 0);

            let bComm = 0;
            let bSebon = 0;
            let totalBuy = buyAmt;


            // Only Secondary market includes buying charges
            if (this.shareType === 'Secondary' && buyAmt > 0) {

                bComm = getComm(buyAmt);
                bSebon = buyAmt * sebonRate;

                totalBuy = buyAmt + bComm + bSebon + dpFee;

            }



            // ================= SELL SIDE =================

            const sellAmt = (this.qty || 0) * (this.sellPrice || 0);

            const sComm = sellAmt > 0 ? getComm(sellAmt) : 0;
            const sSebon = sellAmt * sebonRate;



            // ================= COST BASIS =================

            let costBasis = 0;


            if (this.shareType === 'Secondary') {

                // Secondary uses WACC amount
                costBasis = totalBuy;

            } else {

                // IPO/FPO/Right/Bonus/Auction use only purchase value
                costBasis = buyAmt;

            }



            // ================= PROFIT =================

            const taxableProfit =
                (sellAmt - sComm - sSebon - dpFee) - costBasis;



            let cgtRate =
                (this.holding === 'short') ? 0.10 :
                (this.holding === 'institutional') ? 0.10 :
                0.075;



            const tax =
                (this.mode === 'sell' && taxableProfit > 0)
                ? taxableProfit * cgtRate
                : 0;



            const hasValidInput =
                (this.qty > 0 &&
                (this.buyPrice > 0 || this.sellPrice > 0));



            const netRec =
                hasValidInput
                ? (sellAmt - sComm - sSebon - dpFee - tax)
                : 0;



            const netProfit =
                hasValidInput
                ? (netRec - costBasis)
                : 0;



            return {

                buyComm: this.customRound(bComm),

                buySebon: this.customRound(bSebon),

                // Shows WACC only for reference
                wacc: this.customRound(totalBuy),


                sellComm: this.customRound(sComm),

                sellSebon: this.customRound(sSebon),


                dp: (hasValidInput && (this.mode === 'sell' || this.shareType === 'Secondary')) ? "25.00" : "0.00",


                cgt: this.customRound(tax),

                receivable: this.customRound(netRec),

                profit: this.customRound(netProfit),

                isProfit: netProfit >= 0
            };
        }
    }
}