import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  [key: string]: any; 
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const isEmptyData =
    !data?.data ||
    (Array.isArray(data?.data) && data?.data?.length === 0) ||
    (typeof data?.data === "object" && Object.keys(data?.data)?.length === 0);

  if (isEmptyData) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: "No Data Found",
      data: [],
    });
  }

  const response = { ...data };

  res.status(data?.statusCode).json(response);
};

export default sendResponse;
