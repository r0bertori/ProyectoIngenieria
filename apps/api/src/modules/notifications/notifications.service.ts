import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendOrderCreatedEmail(order: any) {
    const subject = `Nuevo pedido ${order.orderNumber}`;
    const body = `
      Se ha creado un nuevo pedido.

      Número de pedido: ${order.orderNumber}
      Cliente: ${order.store.name}
      Total: ${order.totalAmount}€

      Accede al panel para ver los detalles.
    `;

    await this.sendEmail(
      order.distributor.email,
      subject,
      body,
      NotificationType.ORDER_CREATED,
      order.id,
    );

    // Also notify the store
    await this.sendEmail(
      order.store.email,
      `Confirmación de pedido ${order.orderNumber}`,
      `Tu pedido ${order.orderNumber} ha sido recibido y está siendo procesado.`,
      NotificationType.ORDER_CREATED,
      order.id,
    );
  }

  async sendOrderStatusChangedEmail(order: any) {
    const statusLabels: Record<string, string> = {
      SUBMITTED: 'Enviado',
      CONFIRMED: 'Confirmado',
      PREPARING: 'En preparación',
      SHIPPED: 'Enviado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
      INCIDENT_REPORTED: 'Incidencia reportada',
    };

    const subject = `Actualización de pedido ${order.orderNumber}`;
    const body = `
      Tu pedido ${order.orderNumber} ha cambiado de estado.

      Nuevo estado: ${statusLabels[order.status] || order.status}
      ${order.trackingNumber ? `Número de seguimiento: ${order.trackingNumber}` : ''}

      Accede al portal para ver los detalles.
    `;

    await this.sendEmail(
      order.store.email,
      subject,
      body,
      NotificationType.ORDER_STATUS_CHANGED,
      order.id,
    );
  }

  async sendIncidentCreatedEmail(incident: any) {
    const subject = `Nueva incidencia ${incident.incidentNumber}`;
    const body = `
      Se ha reportado una incidencia para el pedido ${incident.order.orderNumber}.

      Tipo: ${incident.type}
      Descripción: ${incident.description}

      Por favor, revisa y gestiona esta incidencia.
    `;

    await this.sendEmail(
      incident.order.distributor.email,
      subject,
      body,
      NotificationType.INCIDENT_CREATED,
      incident.id,
    );
  }

  private async sendEmail(
    to: string,
    subject: string,
    body: string,
    type: NotificationType,
    referenceId: string,
  ) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to,
        subject,
        text: body,
      });

      await this.prisma.notificationLog.create({
        data: {
          type,
          recipientEmail: to,
          subject,
          body,
          referenceId,
          status: 'sent',
        },
      });
    } catch (error) {
      await this.prisma.notificationLog.create({
        data: {
          type,
          recipientEmail: to,
          subject,
          body,
          referenceId,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}
