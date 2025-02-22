import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

//extend Prisma client to access to database
@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');
  onModuleInit() {
    //Confirm the connection in the terminal
    this.$connect();
    this.logger.log(`Database is connected.`);
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
    // return 'This action adds a new product';
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.product.count();
    const lastPage = Math.ceil(totalPages / limit!);

    return {
      data: await this.product.findMany({
        skip: (page! - 1) * limit!,
        take: limit,
        where: {
          available: true,
        },
      }),
      meta: {
        page,
        total: totalPages,
        lastPage,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: {
        id: id,
        available: true,
      },
    });

    if (!product) {
      throw new RpcException({
        message: `The product with id: #${id} is not found`,
        status: HttpStatus.UNAUTHORIZED,
      }); //exeptions microservices
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...rest } = updateProductDto;
    await this.findOne(id);

    return await this.product.update({
      data: rest,
      where: { id: id, available: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.product.update({
      data: {
        available: false,
      },
      where: {
        id,
      },
    });

    return {
      message: `The product with id: #${id} was deleted successfully`,
    };
  }

  async validateProducts(ids: any) {
    // ids = [5, 6];
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: `Some products are not found`,
        state: HttpStatus.BAD_REQUEST,
      });
    }

    return products;
  }
}
