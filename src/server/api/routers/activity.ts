import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const activityRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        about: z.string().min(1),
        hoursWorked: z.number().positive(),
        remark: z.string().optional(),
        verifiedBy: z.string().optional(),
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the user owns the project
        const project = await ctx.db.project.findUnique({
          where: { id: input.projectId },
          select: { createdById: true },
        });

        // if (!project || project.createdById !== ctx.session.user.id) {
        //   throw new Error("Not authorized to add activities to this project");
        // }

        return ctx.db.activity.create({
          data: {
            about: input.about,
            hoursWorked: input.hoursWorked,
            remark: input.remark,
            // performedBy: input.performedBy,
            performedBy: { connect: { id: ctx.session.user.id } },
            verifiedBy: input.verifiedBy,
            project: { connect: { id: input.projectId } },
          },
        });
      } catch (error) {
        console.error("Error creating activity:", error);
        throw new Error("Failed to create activity");
      }
    }),

  getAllByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Ensure the user has access to this project
        const project = await ctx.db.project.findUnique({
          where: { id: input.projectId },
          select: { createdById: true },
        });

        if (!project || project.createdById !== ctx.session.user.id) {
          throw new Error("Not authorized to view activities for this project");
        }

        return ctx.db.activity.findMany({
          where: { projectId: input.projectId },
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        console.error("Error fetching activities:", error);
        throw new Error("Failed to fetch activities");
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const activity = await ctx.db.activity.findUnique({
          where: { id: input.id },
          include: { project: { select: { createdById: true } } },
        });

        if (!activity) {
          throw new Error("Activity not found");
        }

        if (activity.project.createdById !== ctx.session.user.id) {
          throw new Error("Not authorized to view this activity");
        }

        return activity;
      } catch (error) {
        console.error("Error fetching activity:", error);
        throw new Error("Failed to fetch activity");
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        about: z.string().min(1).optional(),
        hoursWorked: z.number().positive().optional(),
        remark: z.string().optional().nullable(),
        verifiedBy: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the user has access to this activity via project ownership
        const activity = await ctx.db.activity.findUnique({
          where: { id: input.id },
          include: { project: { select: { createdById: true } } },
        });

        if (!activity) {
          throw new Error("Activity not found");
        }

        if (activity.project.createdById !== ctx.session.user.id) {
          throw new Error("Not authorized to update this activity");
        }

        return ctx.db.activity.update({
          where: { id: input.id },
          data: {
            about: input.about,
            hoursWorked: input.hoursWorked,
            remark: input.remark,
            verifiedBy: input.verifiedBy,
          },
        });
      } catch (error) {
        console.error("Error updating activity:", error);
        throw new Error("Failed to update activity");
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the user has access to this activity via project ownership
        const activity = await ctx.db.activity.findUnique({
          where: { id: input.id },
          include: { project: { select: { createdById: true } } },
        });

        if (!activity) {
          throw new Error("Activity not found");
        }

        // if (activity.project.createdById !== ctx.session.user.id) {
        //   throw new Error("Not authorized to delete this activity");
        // }

        return ctx.db.activity.delete({
          where: { id: input.id },
        });
      } catch (error) {
        console.error("Error deleting activity:", error);
        throw new Error("Failed to delete activity");
      }
    }),
});
