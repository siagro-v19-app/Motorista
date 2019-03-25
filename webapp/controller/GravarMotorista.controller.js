sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"idxtec/lib/fragment/ParceiroNegocioHelpDialog"
], function(Controller, History, MessageBox, JSONModel, ParceiroNegocioHelpDialog) {
	"use strict";

	return Controller.extend("br.com.idxtecMotorista.controller.GravarMotorista", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarmotorista").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		parceiroNegocioReceived: function() {
			this.getView().byId("parceironegocio").setSelectedKey(this.getModel("model").getProperty("/ParceiroNegocio"));
		},
		
		handleSearchParceiro: function(oEvent){
			var oHelp = new ParceiroNegocioHelpDialog(this.getView(), "parceironegocio");
			oHelp.getDialog().open();
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("parceironegocio").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Motorista"
				});
			
				var oNovoMotorista = {
					"Id": 0,
					"Nome": "",
					"Cpf": "",
					"Email": "",
					"Telefone": "",
					"ParceiroNegocio": 0,
					"Bloqueado": false,
					"Observacoes": ""
				};
				
				oJSONModel.setData(oNovoMotorista);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Motorista"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.information("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createMotorista();
			} else if (this._operacao === "editar") {
				this._updateMotorista();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
				} else {
					oRouter.navTo("motorista", {}, true);
				}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.ParceiroNegocio = oDados.ParceiroNegocio ? parseInt(oDados.ParceiroNegocio, 0) : 0;
			
			oDados.ParceiroNegocioDetails = {
				__metadata: {
					uri: "/ParceiroNegocios(" + oDados.ParceiroNegocio + ")"
				}
			};
			return oDados;
		},
		
		_createMotorista: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/Motoristas", this._getDados(), {
				success: function() {
					MessageBox.success("Motorista inserido com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_updateMotorista: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Motorista alterado com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("nome").getValue() === "" || oView.byId("cpf").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});

});