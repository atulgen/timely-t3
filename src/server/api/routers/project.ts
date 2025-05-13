import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Get all projects, but include activities only if they belong to the current user
    const projects = await ctx.db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        activities: {
          where: {
            performedById: ctx.session.user.id,
          },
        },
      },
    });

    return projects;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.project.findUnique({
        where: { id: input.id },
        include: { activities: true },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the user owns this project
        const project = await ctx.db.project.findUnique({
          where: { id: input.id },
          select: { createdById: true },
        });

        if (!project || project.createdById !== ctx.session.user.id) {
          throw new Error("Not authorized to update this project");
        }

        return ctx.db.project.update({
          where: { id: input.id },
          data: { name: input.name },
        });
      } catch (error) {
        console.error("Error updating project:", error);
        throw new Error("Failed to update project");
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure the user owns this project
        const project = await ctx.db.project.findUnique({
          where: { id: input.id },
          select: { createdById: true },
        });

        if (!project || project.createdById !== ctx.session.user.id) {
          throw new Error("Not authorized to delete this project");
        }

        // Delete all associated activities first (if cascade delete is not set up)
        await ctx.db.activity.deleteMany({
          where: { projectId: input.id },
        });

        return ctx.db.project.delete({
          where: { id: input.id },
        });
      } catch (error) {
        console.error("Error deleting project:", error);
        throw new Error("Failed to delete project");
      }
    }),
});
