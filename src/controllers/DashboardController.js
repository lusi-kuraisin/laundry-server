const { Transaction, Customer, TransactionDetail } = require("../../models");
const { Op, fn, col, literal } = require("sequelize");

const getDayRange = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

const getDaysAgo = (days) => {
  const date = new Date();

  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

exports.getStats = async (req, res) => {
  try {
    const { startOfDay: todayStart, endOfDay: todayEnd } = getDayRange(
      new Date()
    );

    const { startOfDay: yesterdayStart, endOfDay: yesterdayEnd } = getDayRange(
      getDaysAgo(1)
    );

    const totalCustomers = await Customer.count();

    const newOrdersToday = await Transaction.count({
      where: {
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    const todayRevenue = await Transaction.sum("total_price", {
      where: {
        payment_status: "paid",
        createdAt: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
    });

    const yesterdayRevenue = await Transaction.sum("total_price", {
      where: {
        payment_status: "paid",
        createdAt: {
          [Op.between]: [yesterdayStart, yesterdayEnd],
        },
      },
    });

    const totalProcessingOrders = await Transaction.count({
      where: {
        laundry_status: {
          [Op.in]: ["new", "processing"],
        },
      },
    });

    const totalOrders = await Transaction.count();

    let revenueChangePercent = 0;
    if (yesterdayRevenue > 0) {
      revenueChangePercent = (
        ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) *
        100
      ).toFixed(2);
    } else if (todayRevenue > 0) {
      revenueChangePercent = 100;
    }

    const processingPercentage =
      totalOrders > 0 ? (totalProcessingOrders / totalOrders) * 100 : 0;

    res.status(200).json({
      status: "Success",
      message: "Data dashboard berhasil diambil! ✨",
      data: {
        totalCustomers,
        newOrdersToday: newOrdersToday || 0,
        totalRevenueToday: todayRevenue || 0,
        totalProcessingOrders: totalProcessingOrders || 0,
        totalOrders: totalOrders || 0,
        revenueChangePercent,
        processingPercentage,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
    res.status(500).json({
      status: "Error",
      message: "Gagal mengambil data statistik internal server error.",
    });
  }
};

exports.getChartsData = async (req, res) => {
  try {
    const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const sevenDaysAgo = getDaysAgo(6);
    const weeklyOrderData = {};

    for (let i = 6; i >= 0; i--) {
      const date = getDaysAgo(i);
      const dayName = dayLabels[date.getDay()];
      weeklyOrderData[dayName] = 0;
    }

    const weeklyOrders = await Transaction.findAll({
      attributes: [
        [literal("strftime('%Y-%m-%d', `createdAt`)"), "date_only"],
        [fn("count", col("id")), "total_orders"],
      ],
      where: {
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
      group: [literal("strftime('%Y-%m-%d', `createdAt`)")],
      order: [[literal("strftime('%Y-%m-%d', `createdAt`)"), "ASC"]],
      raw: true,
    });

    weeklyOrders.forEach((item) => {
      const dateObj = new Date(item.date_only);

      const dayName = dayLabels[dateObj.getDay()];

      if (weeklyOrderData.hasOwnProperty(dayName)) {
        weeklyOrderData[dayName] = parseInt(item.total_orders, 10);
      }
    });

    const weeklyOrdersResult = {
      categories: Object.keys(weeklyOrderData),
      data: Object.values(weeklyOrderData),
    };

    const twelveMonthsAgo = getDaysAgo(365);

    const monthlyRevenue = await Transaction.findAll({
      attributes: [
        [literal("strftime('%Y-%m', `createdAt`)"), "year_month"],
        [fn("SUM", col("total_price")), "total_revenue"],
      ],
      where: {
        payment_status: "paid",
        createdAt: {
          [Op.gte]: twelveMonthsAgo,
        },
      },
      group: [literal("strftime('%Y-%m', `createdAt`)")],
      order: [[literal("strftime('%Y-%m', `createdAt`)"), "ASC"]],
      raw: true,
    });

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    const monthlyRevenueData = { categories: [], data: [] };

    (monthlyRevenue || []).slice(-6).forEach((item) => {
      const monthIndex = parseInt(item.year_month.slice(5, 7), 10) - 1;
      monthlyRevenueData.categories.push(`${monthNames[monthIndex]}`);
      monthlyRevenueData.data.push(parseFloat(item.total_revenue));
    });

    const monthlyWeight = await TransactionDetail.findAll({
      attributes: [
        [literal("strftime('%Y-%m', `transaction`.`createdAt`)"), "year_month"],
        [fn("SUM", col("qty_weight")), "total_weight"],
      ],
      include: [
        {
          model: Transaction,
          as: "transaction",
          attributes: [],
          required: true,
          where: {
            createdAt: { [Op.gte]: twelveMonthsAgo },
          },
        },
      ],
      group: [literal("strftime('%Y-%m', `transaction`.`createdAt`)")],
      order: [["year_month", "ASC"]],
      raw: true,
    });

    const monthlyWeightData = { categories: [], data: [] };

    (monthlyWeight || []).slice(-6).forEach((item) => {
      const monthIndex = parseInt(item.year_month.slice(5, 7), 10) - 1;
      monthlyWeightData.categories.push(`${monthNames[monthIndex]}`);
      monthlyWeightData.data.push(parseFloat(item.total_weight));
    });

    res.status(200).json({
      status: "Success",
      message: "Data charts berhasil diambil! ✨",
      data: {
        weeklyOrders: weeklyOrdersResult,
        monthlyRevenue: monthlyRevenueData,
        monthlyWeight: monthlyWeightData,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil data charts:", error);
    res.status(500).json({
      status: "Error",
      message: "Gagal mengambil data charts internal server error.",
    });
  }
};
