const pool = require('../../../../config/database');
const common = require('../../../../utilities/common');
const responseCode = require('../../../../utilities/response_code');
const response_message = require('../../../../language/en');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

class user_model {


    signup(req, res) {
        console.log("Request Body model:", req.body);
        const request_data = req.body;
        const data = {
            name: request_data.name,
            email: request_data.email,
            password: request_data.password ? md5(request_data.password) : null,
            country_code: request_data.country_code || "+91",
            phone: request_data.phone,
            is_active: 1,
            is_deleted: 0,
        };
        const insertUserQuery = "insert into tbl_user set ?";
        pool.query(insertUserQuery, data, (error, result) => {
            if (error) {
                console.error(error);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                });
            }

            const user_id = result.insertId;
            const otp = common.generateOTP();

            const insertOtpQuery = "insert into tbl_otp set ?";
            pool.query(insertOtpQuery, { user_id, otp, phone: request_data.phone, email: request_data.email, action: 'signup' }, (err) => {
                if (err) {
                    console.error(err);
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.unsuccess,
                        data: err.sqlMessage,
                    });
                }

                const user_token = jwt.sign({ user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });

                console.log("User Token:", user_token);

                const device_data = {
                    user_id: user_id,
                    device_type: request_data.device_type || 'android',
                    device_name: request_data.device_name || 'unknown',
                    os_version: request_data.os_version || 'unknown',
                    app_version: request_data.app_version || '1.0',
                    user_token: user_token,
                    timezone: request_data.timezone || 'UTC',
                    is_active: 1,
                    is_deleted: 0,
                };

                const insertDeviceQuery = "insert into tbl_device_info set ?";
                pool.query(insertDeviceQuery, device_data, (error) => {
                    if (error) {
                        console.error(error);
                        return common.response(res, {
                            code: responseCode.OPERATION_FAILED,
                            message: response_message.unsuccess,
                            data: error.sqlMessage,
                        });
                    }

                    return common.response(res, {
                        code: responseCode.SUCCESS,
                        message: [response_message.success, response_message.otp_has_sent_successfully],
                        data: { user_id, user_token, otp },
                    });
                });
            });
        });
    }

    verifyOTP(req, res) {
        console.log("Request Body model:", req.body);
        const user_id = req.user.id;
        const { otp } = req.body;

        if (!user_id || !otp) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: req.language.missing_parameters || "Missing required parameters",
                data: null,
            });
        }

        const selectQuery = 'select * from tbl_otp where user_id = ? and otp = ? and action = "signup"';
        pool.query(selectQuery, [user_id, otp], (err, result) => {
            if (err) {
                console.error("Database Query Error:", err);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: req.language.unsuccess || "Operation failed",
                    data: err.sqlMessage,
                });
            }
            // console.log("Query Result:", result, otp);
            // console.log("Query Result:", result[0].otp, otp);
            if (result[0].otp == otp) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: req.language.otp_verified_successfully || "OTP verified successfully",
                    data: { user_id },
                });
            }
            else {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: req.language.invalid_otp || "Invalid OTP",
                    data: null,
                });
            }
        });


    }

    // login user
    login(req, res) {
        console.log("Request Body model:", req.body);
        const request_data = req.body;

        if (request_data.password) {
            request_data.password = md5(request_data.password);
            console.log("Data:", request_data.password);

        }

        const selectQuery = `select * from tbl_user where email = ? and password = ? and is_deleted = 0`;
        const condition = [request_data.email, request_data.password];

        console.log("Select Query:", selectQuery);
        console.log("Condition:", condition);

        pool.query(selectQuery, condition, (error, _userInfo) => {
            if (error) {
                console.error("Database Query Error:", error);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                });
            }

            console.log("Query Result:", _userInfo);

            if (_userInfo && _userInfo.length >= 1) {
                const user = _userInfo[0];
                console.log("User Info:", user.role);
                if (user.is_active !== 1) {
                    return common.response(res, {
                        code: responseCode.INACTIVE_ACCOUNT,
                        message: response_message.account_is_deactivated,
                        data: null,
                    });
                }

                const user_token = jwt.sign({ user_id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

                // set token in a cookie
                res.cookie('token', user_token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000, //1d
                });

                const device_data = {
                    user_id: user.id,
                    device_type: request_data.device_type || 'android',
                    device_name: request_data.device_name || 'unknown',
                    os_version: request_data.os_version || 'unknown',
                    app_version: request_data.app_version || '1.0',
                    user_token: user_token,
                    timezone: request_data.timezone || 'UTC',
                    is_active: 1,
                    is_deleted: 0,
                };

                const insertDeviceQuery = "insert into tbl_device_info set ?";
                pool.query(insertDeviceQuery, device_data, (error) => {
                    if (error) {
                        console.error(error);
                        return common.response(res, {
                            code: responseCode.OPERATION_FAILED,
                            message: response_message.unsuccess,
                            data: error.sqlMessage,
                        });
                    }

                    return common.response(res, {
                        code: responseCode.SUCCESS,
                        message: response_message.success,
                        data: { user_id: user.id, role: user.role, user_token },
                    });
                });
            } else {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.login_invalid_credential,
                    data: null,
                });
            }
        });
    }

    // view profile
    viewProfile(req, res) {
        const user_id = req.user.id

        const selectQuery =
            "select id, name, email, phone, country_code, role, is_active, created_at from tbl_user where id = ? and is_deleted = 0"
        pool.query(selectQuery, [user_id], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            if (result.length === 0) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.user_not_found,
                    data: null,
                })
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: response_message.success,
                data: result[0],
            })
        })
    }

    // edit profile
    editProfile(req, res) {
        const user_id = req.user.id
        const request_data = req.body

        const updateData = {
            name: request_data.name,
            phone: request_data.phone,
            country_code: request_data.countryCode,
        }

        const updateQuery = "update tbl_user set ? where id = ?"
        pool.query(updateQuery, [updateData, user_id], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: response_message.profile_updated_successfully || "Profile updated successfully",
                data: null,
            })
        })
    }

    // logout 
    logout(req, res) {
        const token = req.headers.token;
        console.log("TokenB:", token);
        if (!token) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.token_not_provided,
                data: null,
            });
        }

        const updateQuery = "update tbl_device_info set user_token = null where user_token = ?";
        pool.query(updateQuery, [token], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                });
            }

            // clear cookie 
            res.clearCookie('token', {
                httpOnly: true,
                sameSite: 'strict',
            });
            console.log("Cookie cleared");

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: response_message.logout_success,
                data: null,
            });
        });
    }


    getCategories(req, res) {
        const query = `
            select id, name 
            from tbl_category 
            where is_deleted = 0 and is_active = 1
        `;

        pool.query(query, (error, categories) => {
            if (error) {
                console.error("Database Query Error:", error);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                });
            }

            if (categories.length === 0) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.no_categories_found || "No categories found",
                    data: [],
                });
            }

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: response_message.success,
                data: categories,
            });
        });
    }

    getAllSubBoxes(req, res) {
        const { search, category, min_price, max_price, frequency } = req.body
        console.log("body model:", req.body)
        let query = `
                select sb.*, c.name as category_name, 
                min(sp.price) as min_price, max(sp.price) as max_price
                from tbl_subscription_boxes sb
                left join tbl_category c on sb.category_id = c.id
                left join tbl_subscription_plans sp on sb.id = sp.box_id
                where sb.is_deleted = 0 and sb.is_active = 1
            `

        const queryParams = []

        if (search) {
            query += ` and sb.name like ? `
            queryParams.push(`%${search}%`)
        }

        if (category) {
            query += ` and sb.category_id = ? `
            queryParams.push(category)
        }

        query += ` group by sb.id `

        if (min_price) {
            query += ` having min_price >= ? `
            queryParams.push(min_price)
        }

        if (max_price) {
            query += ` ${min_price ? "and" : "having"} max_price <= ? `
            queryParams.push(max_price)
        }

        pool.query(query, queryParams, (error, boxes) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            // console.log("Boxes:", boxes)

            // get plans for each box
            const boxIds = boxes.map((box) => box.id)

            if (boxIds.length === 0) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.success,
                    data: [],
                })
            }

            const plansQuery = `
                    select * from tbl_subscription_plans 
                    where box_id in (?) and is_deleted = 0 and is_active = 1
                `

            pool.query(plansQuery, [boxIds], (err, plans) => {
                if (err) {
                    console.error("Database Query Error:", err)
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.unsuccess,
                        data: err.sqlMessage,
                    })
                }

                // group plans by box_id
                const plansMap = {}
                plans.forEach((plan) => {
                    if (!plansMap[plan.box_id]) {
                        plansMap[plan.box_id] = []
                    }
                    plansMap[plan.box_id].push(plan)
                })

                // add plans to each box
                boxes.forEach((box) => {
                    box.plans = plansMap[box.id] || []
                })

                // console.log("boxes with plans:", boxes)

                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.success,
                    data: boxes,
                })
            })
        })
    }

    getSubscriptionBoxById(req, res) {
        const { id } = req.params

        const query = `
                select sb.*, c.name as category_name
                from tbl_subscription_boxes sb
                join tbl_category c on sb.category_id = c.id
                where sb.id = ? and sb.is_deleted = 0 and sb.is_active = 1
            `

        pool.query(query, [id], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            if (result.length === 0) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.subscription_box_not_found,
                    data: null,
                })
            }

            const box = result[0]
            // console.log("Box:", box)
            // get plans for box
            const plansQuery = `
                    select * from tbl_subscription_plans 
                    where box_id = ? and is_deleted = 0 and is_active = 1
                `

            pool.query(plansQuery, [id], (err, plans) => {
                if (err) {
                    console.error("Database Query Error:", err)
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.unsuccess,
                        data: err.sqlMessage,
                    })
                }

                box.plans = plans
                // console.log("Plans:", plans)

                // get products for each plan
                const planIds = plans.map((plan) => plan.id)

                if (planIds.length === 0) {
                    return common.response(res, {
                        code: responseCode.SUCCESS,
                        message: response_message.success,
                        data: box,
                    })
                }

                const productsQuery = `
                        select * from tbl_product 
                        where plan_id in (?) and is_deleted = 0 and is_active = 1
                    `

                pool.query(productsQuery, [planIds], (err, products) => {
                    if (err) {
                        console.error("Database Query Error:", err)
                        return common.response(res, {
                            code: responseCode.OPERATION_FAILED,
                            message: response_message.unsuccess,
                            data: err.sqlMessage,
                        })
                    }

                    // group products by plan_id
                    const productsMap = {}
                    products.forEach((product) => {
                        if (!productsMap[product.plan_id]) {
                            productsMap[product.plan_id] = []
                        }
                        productsMap[product.plan_id].push(product)
                    })

                    // add products to each plan
                    box.plans.forEach((plan) => {
                        plan.products = productsMap[plan.id] || []
                    })

                    console.log("Box with Plans and Products:", box)

                    return common.response(res, {
                        code: responseCode.SUCCESS,
                        message: response_message.success,
                        data: box,
                    })
                })
            })
        })
    }

    subscribeToBox(req, res) {
        const user_id = req.user.id;
        const { plan_id, payment_method, address } = req.body;

        const planQuery = `
                select sp.* 
                from tbl_subscription_plans sp
                join tbl_subscription_boxes sb on sp.box_id = sb.id
                where sp.id = ? and sp.is_deleted = 0 and sp.is_active = 1
            `;

        pool.query(planQuery, [plan_id], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                });
            }

            if (result.length === 0) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.subscription_plan_not_found,
                    data: null,
                });
            }

            const plan = result[0];

            const subscriptionQuery = `
                    select * from tbl_user_subscription 
                    where user_id = ? and is_deleted = 0 
                    order by end_date desc limit 1
                `;

            pool.query(subscriptionQuery, [user_id], (subError, subResult) => {
                if (subError) {
                    console.error("Database Query Error:", subError);
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.unsuccess,
                        data: subError.sqlMessage,
                    });
                }

                let start_date = new Date();

                if (subResult.length > 0) {
                    const lastSubscription = subResult[0];
                    if (lastSubscription.status === "active") {
                        start_date = new Date(lastSubscription.end_date);
                        start_date.setDate(start_date.getDate() + 1);
                    }
                }

                const end_date = new Date(start_date);
                end_date.setMonth(end_date.getMonth() + plan.months);

                const subscriptionData = {
                    user_id,
                    plan_id,
                    status: "active",
                    start_date,
                    end_date,
                    payment_method: payment_method || "cash",
                };

                pool.query("insert into tbl_user_subscription set ?", subscriptionData, (err, subscriptionResult) => {
                    if (err) {
                        console.error("Database Query Error:", err);
                        return common.response(res, {
                            code: responseCode.OPERATION_FAILED,
                            message: response_message.unsuccess,
                            data: err.sqlMessage,
                        });
                    }

                    // const subscription_id = subscriptionResult.insertId;

                    const orderData = {
                        user_id,
                        plan_id,
                        address: address || "",
                        payment_method: payment_method || "cash",
                        order_status: "pending",
                        order_date: start_date,
                        grand_total: plan.price,
                        is_active: 1,
                        is_deleted: 0,
                    };

                    pool.query("insert into tbl_order set ?", orderData, (err, orderResult) => {
                        if (err) {
                            console.error("Database Query Error:", err);
                            return common.response(res, {
                                code: responseCode.OPERATION_FAILED,
                                message: response_message.unsuccess,
                                data: err.sqlMessage,
                            });
                        }

                        const order_id = orderResult.insertId;

                        return common.response(res, {
                            code: responseCode.SUCCESS,
                            message: response_message.subscription_created_successfully,
                        });
                    });
                });
            });
        });
    }

    getUserSubscriptions(req, res) {
        const user_id = req.user.id

        const query = `
                select us.*, sp.name as plan_name, sp.price, sp.months, sb.name as box_name, sb.description
                from tbl_user_subscription us
                join tbl_subscription_plans sp on us.plan_id = sp.id
                join tbl_subscription_boxes sb on sp.box_id = sb.id
                where us.user_id = ? and us.is_deleted = 0
                order by us.created_at desc
            `

        pool.query(query, [user_id], (error, subscriptions) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            if (subscriptions.length === 0) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.no_subscriptions_found || "No subscriptions found",
                    data: [],
                })
            } else {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.success,
                    data: subscriptions,
                })
            }
        })
    }

    cancelSubscription(req, res) {
        const user_id = req.user.id;
        const { id } = req.params;

        if (!id) {
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.missing_parameters || "Missing required parameters",
                data: null,
            });
        }

        const checkQuery = `
            select * from tbl_user_subscription 
            where id = ? and user_id = ? and is_deleted = 0
        `;

        pool.query(checkQuery, [id, user_id], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error);
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                });
            }

            if (result.length === 0) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.subscription_not_found,
                    data: null,
                });
            }

            const updateQuery = `
                update tbl_user_subscription 
                set status = "cancelled", is_active = 0 
                where id = ? and user_id = ? and is_deleted = 0
            `;

            pool.query(updateQuery, [id, user_id], (updateError) => {
                if (updateError) {
                    console.error("Database Query Error:", updateError);
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.unsuccess,
                        data: updateError.sqlMessage,
                    });
                }

                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.subscription_cancelled_successfully || "Subscription cancelled successfully",
                    data: null,
                });
            });
        });
    }

    getUserOrders(req, res) {
        const user_id = req.user.id

        const query = `
                select o.*, sp.name as plan_name, sp.price, sb.name as box_name
                from tbl_order o
                join tbl_subscription_plans sp on o.plan_id = sp.id
                join tbl_subscription_boxes sb on sp.box_id = sb.id
                where o.user_id = ? and o.is_deleted = 0
                order by o.created_at desc
            `

        pool.query(query, [user_id], (error, orders) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            if (orders.length === 0) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.no_orders_found || "No orders found",
                    data: [],
                });
            } else {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.success,
                    data: orders,
                });
            }
        })
    }

    getOrderDetails(req, res) {
        const user_id = req.user.id
        const { order_id } = req.params

        const query = `
                select o.*, sp.name as plan_name, sp.price, sb.name as box_name, sb.description
                from tbl_order o
                join tbl_subscription_plans sp on o.plan_id = sp.id
                join tbl_subscription_boxes sb on sp.box_id = sb.id
                where o.id = ? and o.user_id = ? and o.is_deleted = 0
            `

        pool.query(query, [order_id, user_id], (error, result) => {
            if (error) {
                console.error("Database Query Error:", error)
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.unsuccess,
                    data: error.sqlMessage,
                })
            }

            if (result.length === 0) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.order_not_found,
                    data: null,
                })
            }

            const order = result[0]

            const productsQuery = `
                    select * from tbl_product 
                    where plan_id = ? and is_deleted = 0 and is_active = 1
                `

            pool.query(productsQuery, [order.plan_id], (err, products) => {
                if (err) {
                    console.error("Database Query Error:", err)
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.unsuccess,
                        data: err.sqlMessage,
                    })
                }

                order.products = products
                console.log("Order with Products:", order)
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: response_message.success,
                    data: order,
                })
            })
        })
    }

}

module.exports = new user_model();

