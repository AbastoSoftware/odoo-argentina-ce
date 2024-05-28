odoo.define('l10n_ar_pos_afipws_fe.pos_order',function(require){
    "use strict"
    var models = require("point_of_sale.models");
    var SuperPosModel = models.PosModel.prototype;
    var SuperOrder = models.Order.prototype;
    var rpc = require('web.rpc');
    // this.afip_invoice_data = {};

    models.PosModel = models.PosModel.extend({


            _flush_orders: function(orders, options) {
                let self = this;
                let result = SuperPosModel._flush_orders.call(this,orders, options);
                result.then(function(order_server_id){
                    if (options['to_invoice']){
                        rpc.query({
                            model: 'pos.order',
                            method: 'read',
                            args:[order_server_id, [
                                'l10n_ar_afip_qr_image',
                                'afip_auth_mode',
                                'afip_auth_code',
                                'afip_auth_code_due',
                                'account_move',
                                'l10n_latam_document_type',
                                'l10n_ar_invoice_number',
                                'pos_reference',
                                'company_id']
                            ]
                        }).then(function(vals){
                            var order_ids = self.get('orders').models;
                            _.each(vals, function (order_data) {
                                let line = order_ids.findIndex(function (item) {
                                    return item['name'] == order_data['pos_reference']

                                });
                                if (line != -1){
                                    order_ids[line] = {
                                        ...order_ids[line],
                                        ...order_data

                                    }
                                }
                            });
                        });
                    }
                });


                return result

             }
    });
   models.Order = models.Order.extend({
        initialize: function(attributes,options){
            SuperOrder.initialize.apply(this, arguments);
            // this.l10n_ar_afip_qr_image = false;
            // this.afip_auth_mode = false;
            // this.afip_auth_code = false;
            // this.afip_auth_code_due = false;
            // this.account_move = false;
            // this.pos_reference = false;
            // this.company_id = false;
            // this.l10n_latam_document_type = false;
        },
        init_from_JSON: function(json) {
            var res = SuperOrder.init_from_JSON.apply(this, arguments);
            this.l10n_ar_afip_qr_image = json.l10n_ar_afip_qr_image;
            this.afip_auth_mode = json.afip_auth_mode;
            this.afip_auth_code = json.afip_auth_code;
            this.afip_auth_code_due = json.afip_auth_code_due;
            this.account_move = json.account_move;
            this.pos_reference = json.pos_reference;
            this.l10n_latam_document_type = json.l10n_latam_document_type;
            this.l10n_ar_invoice_number = json.l10n_ar_invoice_number;

            return res
        },
        export_for_printing: function(){
            var receipt = SuperOrder.export_for_printing.call(this);
            if (this.collection && this.collection.models){
                let indice = this.collection.models.findIndex(function (item) {
                    return item['uid'] == this.uid
                }, this);
                let la_orden = this.collection.models[indice]
                if (! this.l10n_ar_afip_qr_image) {
                    this.l10n_ar_afip_qr_image = la_orden.l10n_ar_afip_qr_image;
                }
                if (! this.afip_auth_mode) {
                    this.afip_auth_mode = la_orden.afip_auth_mode;
                }
                if (! this.afip_auth_code) {
                    this.afip_auth_code = la_orden.afip_auth_code;
                }
                if (! this.afip_auth_code_due) {
                    this.afip_auth_code_due = la_orden.afip_auth_code_due;
                }
                if (! this.account_move) {
                    this.account_move = la_orden.account_move;
                }
                if (! this.l10n_latam_document_type) {
                    this.l10n_latam_document_type = la_orden.l10n_latam_document_type;
                }
                if (! this.l10n_ar_invoice_number) {
                    this.l10n_ar_invoice_number = la_orden.l10n_ar_invoice_number;
                }
            }

            if(this.to_invoice){
                receipt.l10n_ar_afip_qr_image = this.l10n_ar_afip_qr_image;
                receipt.afip_auth_mode = this.afip_auth_mode;
                receipt.afip_auth_code = this.afip_auth_code;
                receipt.afip_auth_code_due = this.afip_auth_code_due;
                receipt.account_move = this.account_move;
                receipt.pos_reference = this.pos_reference;
                receipt.company_id = this.company_id;
                receipt.l10n_latam_document_type = this.l10n_latam_document_type;
                receipt.l10n_ar_invoice_number = this.l10n_ar_invoice_number;
            }
            console.log(receipt);
            return receipt
        }
   });

});

