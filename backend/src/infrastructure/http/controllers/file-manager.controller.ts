import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import * as multer from 'multer'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { AuthenticatedRequest } from '../interfaces/authenticated-request'
import { FileManagerService } from '../../../application/services/file-manager.service'
import { CreateDirectoryDto } from '../../../application/dto/create-directory.dto'
import { UpdateDirectoryDto } from '../../../application/dto/update-directory.dto'
import { UpdateFileDto } from '../../../application/dto/update-file.dto'
import { UpdateFileGrantsDto } from '../../../application/dto/update-file-grants.dto'

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class FileManagerController {
  constructor(private readonly fileManager: FileManagerService) {}

  @Get()
  async list(@Req() req: AuthenticatedRequest, @Query('directoryId') directoryId?: string) {
    const userId = req.userId!
    const dirId = directoryId === undefined ? null : directoryId === '' ? null : Number(directoryId)
    if (dirId !== null && Number.isNaN(dirId)) {
      throw new BadRequestException({ message: 'Invalid directory id' })
    }
    return this.fileManager.listDirectory(userId, dirId)
  }

  @Post('directories')
  async createDirectory(@Req() req: AuthenticatedRequest, @Body() dto: CreateDirectoryDto) {
    const userId = req.userId!
    return this.fileManager.createDirectory(userId, dto)
  }

  @Patch('directories/:id')
  async updateDirectory(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDirectoryDto,
  ) {
    const userId = req.userId!
    return this.fileManager.updateDirectory(userId, id, dto)
  }

  @Delete('directories/:id')
  async deleteDirectory(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    const userId = req.userId!
    await this.fileManager.deleteDirectory(userId, id)
    return { success: true }
  }

  @Put('directories/:id/grants')
  async setDirectoryGrants(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFileGrantsDto,
  ) {
    const userId = req.userId!
    await this.fileManager.updateDirectoryGrants(userId, id, dto)
    return { success: true }
  }

  @Post('files')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
  }))
  async uploadFile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body('directoryId') directoryId?: string,
    @Body('displayName') displayName?: string,
    @Body('visibility') visibility?: string,
  ) {
    if (!file) {
      throw new BadRequestException({ message: 'File is required' })
    }
    const userId = req.userId!
    const dirId = directoryId === undefined || directoryId === '' ? null : Number(directoryId)
    const visibilityValue = visibility === 'public' ? 'public' : 'private'
    return this.fileManager.uploadFile(userId, file.buffer, file.originalname, {
      directoryId: dirId,
      displayName,
      visibility: visibilityValue,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    })
  }

  @Patch('files/:id')
  async updateFile(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFileDto,
  ) {
    const userId = req.userId!
    return this.fileManager.updateFile(userId, id, dto)
  }

  @Delete('files/:id')
  async deleteFile(@Req() req: AuthenticatedRequest, @Param('id', ParseIntPipe) id: number) {
    const userId = req.userId!
    await this.fileManager.deleteFile(userId, id)
    return { success: true }
  }

  @Put('files/:id/grants')
  async setFileGrants(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFileGrantsDto,
  ) {
    const userId = req.userId!
    await this.fileManager.updateFileGrants(userId, id, dto)
    return { success: true }
  }
}
