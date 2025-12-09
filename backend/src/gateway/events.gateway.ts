import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.connectedUsers.set(client.id, data.userId);
    client.join(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} joined`);
    return { event: 'joined', data: { userId: data.userId } };
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.connectedUsers.delete(client.id);
    client.leave(`user:${data.userId}`);
    this.logger.log(`User ${data.userId} left`);
    return { event: 'left', data: { userId: data.userId } };
  }

  // Emit new listing event to all clients
  emitNewListing(listing: any, type: string) {
    this.server.emit('new-listing', { listing, type });
  }

  // Emit listing update to all clients
  emitListingUpdate(listingId: string, type: string, data: any) {
    this.server.emit('listing-updated', { listingId, type, data });
  }

  // Emit listing deleted to all clients
  emitListingDeleted(listingId: string, type: string) {
    this.server.emit('listing-deleted', { listingId, type });
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  // Send message to specific user
  sendMessage(userId: string, message: any) {
    this.server.to(`user:${userId}`).emit('message', message);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }
}
