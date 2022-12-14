describe("Open Excel Upload dialog", () => {
	const optionsLong = {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: true
	};
	const optionsShort = {
		month: "short",
		day: "numeric",
		year: "numeric"
	};

	it("should trigger search on ListReport page", async () => {
		const goButton = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--listReportFilter-btnGo"
			}
		});
		if (goButton._domId) {
			await goButton.press();
		} else {
			const title = await browser.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--template:::ListReportPage:::DynamicPageTitle"
				}
			});
			await title.press();

			const goButtonExpanded = await browser.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--listReportFilter-btnGo"
				}
			});
			await goButtonExpanded.press();
		}
	});

	it("go to object page", async () => {
		const table = await browser.asControl({
			selector: {
				interaction: "root",
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ListReport.view.ListReport::Orders--responsiveTable"
			}
		});
		const items = await table.getItems();
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object.OrderNo === "2") {
				try {
					const path = binding.sPath;
					await browser.goTo({ sHash: `#${path}` });
				} catch (error) {
					// click faile
					console.log(error);
				}
				break;
			}
		}
		// force wait to stabelize tests
		try {
			await $("filtekuzfutkfk424214").waitForExist({ timeout: 1000 });
		} catch (error) {}
	});

	it("go to edit mode", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--edit"
				}
			})
			.press();
	});

	it("Open ExcelUpload Dialog V2", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--action::excelUploadButton"
				}
			})
			.press();
		const excelUploadDialog = await browser.asControl({
			selector: {
				controlType: "sap.m.Dialog",
				properties: {
					title: "Excel Upload"
				},
				searchOpenDialogs: true
			}
		});
		expect(excelUploadDialog.isOpen()).toBeTruthy();
	});

	it("Upload file", async () => {
		const uploader = await browser.asControl({
			forceSelect: true,

			selector: {
				interaction: "root",
				controlType: "sap.ui.unified.FileUploader",
				id: "__uploader0"
			}
		});
		const fileName = "test/testFiles/TwoRowsNoErrors.xlsx"; // relative to wdio.conf.(j|t)s
		const remoteFilePath = await browser.uploadFile(fileName); // this also works in CI senarios!
		// transition from wdi5 api -> wdio api
		const $uploader = await uploader.getWebElement(); // wdi5
		const $fileInput = await $uploader.$("input[type=file]"); // wdio
		await $fileInput.setValue(remoteFilePath); // wdio
		await browser
			.asControl({
				selector: {
					controlType: "sap.m.Button",
					properties: {
						text: "Upload"
					}
				}
			})
			.press();
	});

	it("execute save", async () => {
		await browser
			.asControl({
				selector: {
					id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--activate"
				}
			})
			.press();
	});

	it("go to Sub Detail Page", async () => {
		const table = await browser.asControl({
			selector: {
				interaction: "root",
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::Orders--Items::com.sap.vocabularies.UI.v1.LineItem::responsiveTable"
			}
		});
		const items = await table.getItems();
		const rootBinding = await table.getBindingContext();
		const rootPath = await rootBinding.getPath();
		for (let index = 0; index < items.length; index++) {
			const element = items[index];
			const binding = await element.getBindingContext();
			const object = await binding.getObject();
			if (object.product_ID === "254") {
				try {
					const path = binding.sPath;
					await browser.goTo({ sHash: `#${rootPath}${path}` });
				} catch (error) {
					console.log(error);
				}
				break;
			}
		}
		// force wait to stabelize tests
		try {
			await $("filtekuzfutkfk424214").waitForExist({ timeout: 1000 });
		} catch (error) {}
	});

	it("check Field: Quantity", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::quantity::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("3");
	});

	it("check Field: Product", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::title::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("Product Test 2");
	});

	it("check Field: UnitPrice", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::price::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("13.7");
	});

	it("check Field: validFrom", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "validFrom"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: timestamp", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "timestamp"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsLong);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: date", async () => {
		const selector = {
			selector: {
				controlType: "sap.ui.comp.smartform.GroupElement",
				descendant: {
					controlType: "sap.ui.comp.smartfield.SmartLabel",
					properties: {
						text: "date"
					}
				}
			}
		};
		const formElement = await browser.asControl(selector);
		const fields = await formElement.getFields();
		const field = fields[0];
		const binding = await field.getBinding("text");
		const date = await binding.getValue();
		const formattedDate = await date.toLocaleString("en-US", optionsShort);
		const valueText = await field.getText();
		expect(valueText).toBe(formattedDate);
	});

	it("check Field: time", async () => {
		const field = await browser.asControl({
			selector: {
				id: "ui.v2.ordersv2fe::sap.suite.ui.generic.template.ObjectPage.view.Details::OrderItems--com.sap.vocabularies.UI.v1.Identification::time::Field"
			}
		});
		const value = await field.getText();
		expect(value).toBe("4:00:00 PM");
	});
});
