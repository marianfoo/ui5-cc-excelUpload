sap.ui.define([], function () {
	"use strict";
	return {
		/**
		 * Create Dialog to Upload Excel and open it
		 * @param {*} oEvent
		 */
		openExcelUploadDialog: async function (oEvent) {
			this._view.setBusyIndicatorDelay(0);
			this._view.setBusy(true);
			if (!this.excelUpload) {
				this.excelUpload = await sap.ui.getCore().createComponent({
					name: "cc.excelUpload",
					async: false,
					componentData: {
						context: this,
						activateDraft: true
					}
				});

				// event to check before uploaded to app
				this.excelUpload.attachCheckBeforeRead(function (oEvent) {
					// example
					const sheetData = oEvent.getParameter("sheetData");
					let errorArray = [
						{
							title: "Price to high (max 100)",
							counter: 0
						}
					];
					for (const row of sheetData) {
						//check for invalid date
						if (row.UnitPrice) {
							if (row.UnitPrice > 100) {
								errorArray[0].counter = errorArray[0].counter + 1;
							}
						}
					}
					oEvent.getSource().addToErrorsResults(errorArray);
				}, this);

				// event to change data before send to backend
				this.excelUpload.attachChangeBeforeCreate(function (oEvent) {
					let payload = oEvent.getParameter("payload");
					// round number from 12,56 to 12,6
					if (payload.price) {
						payload.price = Number(payload.price.toFixed(1));
					}
					oEvent.getSource().setPayload(payload);
				}, this);
			}
			this.excelUpload.openExcelUploadDialog();
			this._view.setBusy(false);
		},

		submit: async function () {
			const type = "OrdersService.Orders";
			const payload = {
				OrderNo: "3",
				buyer: "test@test.de"
			};
			const model = this._view.getModel();
			const binding = this.byId("ui.v4.ordersv4fe::OrdersList--fe::table::Orders::LineItem-innerTable").getBinding("items");
			const context = binding.create(payload);
			const context2 = binding.create(payload);
			await context.created();
			await context2.created();
			await model.submitBatch(model.getUpdateGroupId());
			const operation = context.getModel().bindContext("OrdersService.draftActivate" + "(...)", context, { $$inheritExpandSelect: true });
			const operation2 = context2.getModel().bindContext("OrdersService.draftActivate" + "(...)", context2, { $$inheritExpandSelect: true });
			operation.execute("$auto", false, null, /*bReplaceWithRVC*/ true);
			operation2.execute("$auto", false, null, /*bReplaceWithRVC*/ true);
			console.log(context);
		}
	};
});
