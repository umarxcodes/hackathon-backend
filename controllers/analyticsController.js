import Appointment from "../models/Appointment.js";
import DiagnosisLog from "../models/DiagnosisLog.js";
import Patient from "../models/Patient.js";
import Prescription from "../models/Prescription.js";
import User from "../models/User.js";

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await User.countDocuments({ role: "doctor" });
    const totalAppointments = await Appointment.countDocuments();

    const appointmentsByMonth = await Appointment.aggregate([
      {
        $match: { date: { $exists: true } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 6 },
      { $project: { month: "$_id", count: 1, _id: 0 } },
    ]);

    const topDiagnoses = await DiagnosisLog.aggregate([
      { $unwind: "$aiResponse.conditions" },
      { $group: { _id: "$aiResponse.conditions", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { condition: "$_id", count: 1, _id: 0 } },
    ]);

    const doctorPerformance = await Appointment.aggregate([
      {
        $group: {
          _id: "$doctorId",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          doctor: "$doctor.name",
          total: 1,
          completed: 1,
          rate: {
            $concat: [
              {
                $toString: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $cond: [
                            { $eq: ["$total", 0] },
                            0,
                            { $divide: ["$completed", "$total"] },
                          ],
                        },
                        100,
                      ],
                    },
                    1,
                  ],
                },
              },
              "%",
            ],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        appointmentsByMonth,
        topDiagnoses,
        doctorPerformance,
      },
      message: "Admin analytics retrieved",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorAnalytics = async (req, res, next) => {
  try {
    const doctorId = req.user.id;
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayAppointments = await Appointment.countDocuments({
      doctorId,
      date: {
        $gte: todayStart,
        $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
      },
    });
    const monthlyAppointments = await Appointment.countDocuments({
      doctorId,
      date: { $gte: monthStart },
    });
    const totalPrescriptions = await Prescription.countDocuments({ doctorId });

    const total = await Appointment.countDocuments({ doctorId });
    const completedCount = await Appointment.countDocuments({
      doctorId,
      status: "completed",
    });
    const completionRate =
      total > 0 ? `${((completedCount / total) * 100).toFixed(1)}%` : "0%";

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        monthlyAppointments,
        totalPrescriptions,
        completionRate,
      },
      message: "Doctor analytics retrieved",
      count: 1,
    });
  } catch (error) {
    next(error);
  }
};
