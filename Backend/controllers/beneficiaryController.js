const pool = require("../db");

const getBeneficiaries = async (req, res) => {
    try {

        const result = await pool.query(

            `SELECT
                users.id,
                users.name,
                users.email,
                beneficiaries.created_at

             FROM beneficiaries

             JOIN users
             ON beneficiaries.beneficiary_id = users.id

             WHERE beneficiaries.user_id = $1

             ORDER BY beneficiaries.created_at DESC`,

            [req.user.id]

        );

        res.json(result.rows);

    } catch (error) {

        res.json({
            success: false,
            message: error.message
        });

    }
};

module.exports = {
    getBeneficiaries
};