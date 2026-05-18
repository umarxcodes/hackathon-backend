import Appointment from "../models/Appointment.js";
import DiagnosisLog from "../models/DiagnosisLog.js";
import Patient from "../models/Patient.js";
import Prescription from "../models/Prescription.js";
import User from "../models/User.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsByMonth,
      topDiagnoses,
      doctorPerformance,
    ] = await Promise.all([
      Patient.countDocuments(),
      User.countDocuments({ role: "doctor" }),
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $match: { date: { $exists: true } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 6 },
        { $project: { month: "$_id", count: 1, _id: 0 } },
      ]),
      DiagnosisLog.aggregate([
        { $unwind: "$aiResponse.conditions" },
        { $group: { _id: "$aiResponse.conditions", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { condition: "$_id", count: 1, _id: 0 } },
      ]),
      Appointment.aggregate([
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
      ]),
    ]);

    return ApiResponse.success(
      res,
      {
        totalPatients,
        totalDoctors,
        totalAppointments,
        appointmentsByMonth,
        topDiagnoses,
        doctorPerformance,
      },
      "Admin analytics retrieved"
    );
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

    const [
      todayAppointments,
      monthlyAppointments,
      totalPrescriptions,
      totalAppointments,
      completedCount,
    ] = await Promise.all([
      Appointment.countDocuments({
        doctorId,
        date: {
          $gte: todayStart,
          $lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
        },
      }),
      Appointment.countDocuments({ doctorId, date: { $gte: monthStart } }),
      Prescription.countDocuments({ doctorId }),
      Appointment.countDocuments({ doctorId }),
      Appointment.countDocuments({ doctorId, status: "completed" }),
    ]);

    const completionRate =
      totalAppointments > 0
        ? `${((completedCount / totalAppointments) * 100).toFixed(1)}%`
        : "0%";

    return ApiResponse.success(
      res,
      {
        todayAppointments,
        monthlyAppointments,
        totalPrescriptions,
        completionRate,
      },
      "Doctor analytics retrieved"
    );
  } catch (error) {
    next(error);
  }
};
