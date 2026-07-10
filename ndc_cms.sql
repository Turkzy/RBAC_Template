-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 06, 2026 at 03:14 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ndc_cms`
--

-- --------------------------------------------------------

--
-- Table structure for table `activitylogs`
--

CREATE TABLE `activitylogs` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip` varchar(255) DEFAULT NULL,
  `userAgent` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activitylogs`
--

INSERT INTO `activitylogs` (`id`, `userId`, `action`, `description`, `metadata`, `ip`, `userAgent`, `createdAt`, `updatedAt`) VALUES
(163, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"mobile\",\"browser\":\"Chrome\",\"platform\":\"Android\"}', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', '2026-07-05 11:04:03', '2026-07-05 11:04:03'),
(164, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"mobile\",\"browser\":\"Chrome\",\"platform\":\"Android\"}', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', '2026-07-05 11:04:15', '2026-07-05 11:04:15'),
(165, 2, 'create', 'Created role sample', '{\"roleId\":5,\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:04:36', '2026-07-05 11:04:36'),
(166, 2, 'delete', 'Deleted role sample', '{\"roleId\":5,\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:04:43', '2026-07-05 11:04:43'),
(167, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:33:04', '2026-07-05 11:33:04'),
(168, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:33:49', '2026-07-05 11:33:49'),
(169, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:38:51', '2026-07-05 11:38:51'),
(170, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:39:23', '2026-07-05 11:39:23'),
(171, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:39:37', '2026-07-05 11:39:37'),
(172, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:40:27', '2026-07-05 11:40:27'),
(173, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:40:41', '2026-07-05 11:40:41'),
(174, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:47:28', '2026-07-05 11:47:28'),
(175, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:47:43', '2026-07-05 11:47:43'),
(176, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:47:55', '2026-07-05 11:47:55'),
(177, 11, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:48:45', '2026-07-05 11:48:45'),
(178, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:48:50', '2026-07-05 11:48:50'),
(179, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:49:15', '2026-07-05 11:49:15'),
(180, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:49:18', '2026-07-05 11:49:18'),
(181, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:50:46', '2026-07-05 11:50:46'),
(182, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:50:49', '2026-07-05 11:50:49'),
(183, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:52:18', '2026-07-05 11:52:18'),
(184, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:52:20', '2026-07-05 11:52:20'),
(185, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:54:15', '2026-07-05 11:54:15'),
(186, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:54:24', '2026-07-05 11:54:24'),
(187, 2, 'update', 'Updated user jasison@ndc.gov.ph: position: - -> Information Systems Researcher I; address: - -> 2940 Orani Street, Tondo Manila; birthdate: - -> 2002-04-22', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":2,\"changes\":[{\"field\":\"position\",\"before\":null,\"after\":\"Information Systems Researcher I\"},{\"field\":\"address\",\"before\":null,\"after\":\"2940 Orani Street, Tondo Manila\"},{\"field\":\"birthdate\",\"before\":null,\"after\":\"2002-04-22\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:55:35', '2026-07-05 11:55:35'),
(188, 2, 'update', 'Updated user jasison@ndc.gov.ph: department: - -> Corporate Planning', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":2,\"changes\":[{\"field\":\"department\",\"before\":null,\"after\":\"Corporate Planning\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:55:47', '2026-07-05 11:55:47'),
(189, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:56:38', '2026-07-05 11:56:38'),
(190, 2, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 11:57:28', '2026-07-05 11:57:28'),
(191, 2, 'create', 'Created user jisellecabero.ndc@gmail.com', '{\"entity\":\"user\",\"createdUserId\":19,\"createdUserEmail\":\"jisellecabero.ndc@gmail.com\",\"createdUserName\":\"Jiselle Cabero\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:00:09', '2026-07-05 12:00:09'),
(192, 2, 'create', 'Created user maryjoyvelarde2015@gmail.com', '{\"entity\":\"user\",\"createdUserId\":20,\"createdUserEmail\":\"maryjoyvelarde2015@gmail.com\",\"createdUserName\":\"Mary Joy Velarde\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:02:05', '2026-07-05 12:02:05'),
(193, 2, 'create', 'Created user czannisgilhang@ndc.gov.ph', '{\"entity\":\"user\",\"createdUserId\":21,\"createdUserEmail\":\"czannisgilhang@ndc.gov.ph\",\"createdUserName\":\"Czannis Gilhang\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:04:32', '2026-07-05 12:04:32'),
(194, 2, 'create', 'Created permission Manage System Settings', '{\"permissionId\":17,\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:25:40', '2026-07-05 12:25:40'),
(195, 2, 'assign', 'Assigned permissions system_settings.manage to role Super Admin', '{\"roleId\":3,\"permissionIds\":[17],\"changes\":[{\"field\":\"permissions\",\"before\":\"-\",\"after\":\"system_settings.manage\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:28:57', '2026-07-05 12:28:57'),
(196, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:41:15', '2026-07-05 12:41:15'),
(197, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:45:50', '2026-07-05 12:45:50'),
(198, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:48:04', '2026-07-05 12:48:04'),
(199, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:56:42', '2026-07-05 12:56:42'),
(200, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:56:47', '2026-07-05 12:56:47'),
(201, 11, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:57:51', '2026-07-05 12:57:51'),
(202, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:57:58', '2026-07-05 12:57:58'),
(203, 2, 'assign', 'Assigned permissions system_settings.manage to role Admin', '{\"roleId\":1,\"permissionIds\":[17],\"changes\":[{\"field\":\"permissions\",\"before\":\"-\",\"after\":\"system_settings.manage\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:58:12', '2026-07-05 12:58:12'),
(204, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:58:21', '2026-07-05 12:58:21'),
(205, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 12:58:25', '2026-07-05 12:58:25'),
(206, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:00:12', '2026-07-05 13:00:12'),
(207, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:06:26', '2026-07-05 13:06:26'),
(208, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:10:40', '2026-07-05 13:10:40'),
(209, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:11:58', '2026-07-05 13:11:58'),
(210, 2, 'update', 'Updated user jasison@ndc.gov.ph: middleName: F. -> Frias', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":2,\"changes\":[{\"field\":\"middleName\",\"before\":\"F.\",\"after\":\"Frias\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:40:20', '2026-07-05 13:40:20'),
(211, 2, 'update', 'Updated user aabalos@ndc.gov.ph: role: Admin -> Super Admin', '{\"entity\":\"user\",\"updatedUserId\":11,\"updaterId\":2,\"changes\":[{\"field\":\"role\",\"before\":\"Admin\",\"after\":\"Super Admin\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:40:53', '2026-07-05 13:40:53'),
(212, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:40:58', '2026-07-05 13:40:58'),
(213, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:41:04', '2026-07-05 13:41:04'),
(214, 11, 'update', 'Updated user jasison@ndc.gov.ph: role: Super Admin -> Admin', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":11,\"changes\":[{\"field\":\"role\",\"before\":\"Super Admin\",\"after\":\"Admin\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:41:19', '2026-07-05 13:41:19'),
(215, 11, 'update', 'Updated user jasison@ndc.gov.ph: role: Admin -> User', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":11,\"changes\":[{\"field\":\"role\",\"before\":\"Admin\",\"after\":\"User\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:41:30', '2026-07-05 13:41:30'),
(216, 11, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:41:36', '2026-07-05 13:41:36'),
(217, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:41:40', '2026-07-05 13:41:40'),
(218, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:41:45', '2026-07-05 13:41:45'),
(219, 11, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:42:05', '2026-07-05 13:42:05'),
(220, 11, 'update', 'Updated user jasison@ndc.gov.ph: role: User -> Super Admin', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":11,\"changes\":[{\"field\":\"role\",\"before\":\"User\",\"after\":\"Super Admin\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:42:20', '2026-07-05 13:42:20'),
(221, 11, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":11,\"userEmail\":\"aabalos@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:42:25', '2026-07-05 13:42:25'),
(222, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:42:30', '2026-07-05 13:42:30'),
(223, 2, 'update', 'Updated user aabalos@ndc.gov.ph: role: Super Admin -> Admin', '{\"entity\":\"user\",\"updatedUserId\":11,\"updaterId\":2,\"changes\":[{\"field\":\"role\",\"before\":\"Super Admin\",\"after\":\"Admin\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 13:42:44', '2026-07-05 13:42:44'),
(224, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:37:31', '2026-07-05 14:37:31'),
(225, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:43:23', '2026-07-05 14:43:23'),
(226, 2, 'create', 'Created role sample', '{\"roleId\":6,\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:50:45', '2026-07-05 14:50:45'),
(227, 2, 'delete', 'Deleted role sample', '{\"roleId\":6,\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:51:17', '2026-07-05 14:51:17'),
(228, 2, 'create', 'Created user irishortiz00@gmail.com', '{\"entity\":\"user\",\"createdUserId\":22,\"createdUserEmail\":\"irishortiz00@gmail.com\",\"createdUserName\":\"irish ortiz\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:54:17', '2026-07-05 14:54:17'),
(229, NULL, 'login', 'User logged in', '{\"entity\":\"user\",\"userId\":22,\"userEmail\":\"irishortiz00@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:56:15', '2026-07-05 14:56:15'),
(230, 2, 'assign', 'Assigned permissions audit_logs.view to role User', '{\"roleId\":2,\"permissionIds\":[7],\"changes\":[{\"field\":\"permissions\",\"before\":\"-\",\"after\":\"audit_logs.view\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:56:35', '2026-07-05 14:56:35'),
(231, 2, 'assign', 'Assigned permissions documents.manage to role User', '{\"roleId\":2,\"permissionIds\":[6],\"changes\":[{\"field\":\"permissions\",\"before\":\"-\",\"after\":\"documents.manage\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:56:56', '2026-07-05 14:56:56'),
(232, 2, 'remove', 'Removed permission audit_logs.view from role User', '{\"roleId\":2,\"permissionId\":7,\"changes\":[{\"field\":\"permissions\",\"before\":\"audit_logs.view\",\"after\":\"-\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:56:56', '2026-07-05 14:56:56'),
(233, 2, 'remove', 'Removed permission documents.manage from role User', '{\"roleId\":2,\"permissionId\":6,\"changes\":[{\"field\":\"permissions\",\"before\":\"documents.manage\",\"after\":\"-\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:57:15', '2026-07-05 14:57:15'),
(234, NULL, 'update', 'Updated user irishortiz00@gmail.com: imageUrl: - -> 1783263466864-5adbe410-b5d4-4430-8ef8-ff157f4a0f90.jpg', '{\"entity\":\"user\",\"updatedUserId\":22,\"updaterId\":22,\"changes\":[{\"field\":\"imageUrl\",\"before\":null,\"after\":\"1783263466864-5adbe410-b5d4-4430-8ef8-ff157f4a0f90.jpg\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:57:46', '2026-07-05 14:57:46'),
(235, NULL, 'update', 'Updated user irishortiz00@gmail.com: address: - -> 123', '{\"entity\":\"user\",\"updatedUserId\":22,\"updaterId\":22,\"changes\":[{\"field\":\"address\",\"before\":null,\"after\":\"123\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:58:25', '2026-07-05 14:58:25'),
(236, NULL, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":22,\"userEmail\":\"irishortiz00@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 14:59:52', '2026-07-05 14:59:52'),
(237, NULL, 'password_reset_requested', 'Password reset requested for irishortiz00@gmail.com', '{\"email\":\"irishortiz00@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:00:17', '2026-07-05 15:00:17'),
(238, NULL, 'password_reset_requested', 'Password reset requested for irishortiz00@gmail.com', '{\"email\":\"irishortiz00@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:07:31', '2026-07-05 15:07:31'),
(239, 2, 'update', 'Updated user irishortiz01@gmail.com: email: irishortiz00@gmail.com -> irishortiz01@gmail.com', '{\"entity\":\"user\",\"updatedUserId\":22,\"updaterId\":2,\"changes\":[{\"field\":\"email\",\"before\":\"irishortiz00@gmail.com\",\"after\":\"irishortiz01@gmail.com\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:09:05', '2026-07-05 15:09:05'),
(240, NULL, 'password_reset_requested', 'Password reset requested for irishortiz01@gmail.com', '{\"email\":\"irishortiz01@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:09:22', '2026-07-05 15:09:22'),
(241, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:18:10', '2026-07-05 15:18:10'),
(242, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:24:25', '2026-07-05 15:24:25'),
(243, 2, 'update', 'Updated user sisonjohnalbert0423@gmail.com: email: jasison@ndc.gov.ph -> sisonjohnalbert0423@gmail.com', '{\"entity\":\"user\",\"updatedUserId\":2,\"updaterId\":2,\"changes\":[{\"field\":\"email\",\"before\":\"jasison@ndc.gov.ph\",\"after\":\"sisonjohnalbert0423@gmail.com\"}],\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:25:16', '2026-07-05 15:25:16'),
(244, 2, 'logout', 'User logged out', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"jasison@ndc.gov.ph\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:25:23', '2026-07-05 15:25:23'),
(245, NULL, 'password_reset_requested', 'Password reset requested for sisonjohnalbert0423@gmail.com', '{\"email\":\"sisonjohnalbert0423@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:25:34', '2026-07-05 15:25:34'),
(246, NULL, 'password_reset_requested', 'Password reset requested for sisonjohnalbert0423@gmail.com', '{\"email\":\"sisonjohnalbert0423@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:47:24', '2026-07-05 15:47:24'),
(247, NULL, 'password_reset_requested', 'Password reset requested for sisonjohnalbert0423@gmail.com', '{\"email\":\"sisonjohnalbert0423@gmail.com\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:53:15', '2026-07-05 15:53:15'),
(248, NULL, 'login_failed', 'Failed login attempt', '{\"emailAttempted\":\"jasison@ndc.gov.ph\",\"ip\":\"127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:56:53', '2026-07-05 15:56:53'),
(249, NULL, 'login_failed', 'Failed login attempt', '{\"emailAttempted\":\"jasison@ndc.gov.ph\",\"ip\":\"127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0\",\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:57:01', '2026-07-05 15:57:01'),
(250, NULL, 'login_failed', 'Failed login attempt', '{\"emailAttempted\":\"sisonjohnalbert0422@gmail.com\",\"ip\":\"127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36\",\"device\":\"mobile\",\"browser\":\"Chrome\",\"platform\":\"Android\"}', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', '2026-07-05 15:57:23', '2026-07-05 15:57:23'),
(251, NULL, 'login_failed', 'Failed login attempt', '{\"emailAttempted\":\"sisonjohnalbert0422@gmail.com\",\"ip\":\"127.0.0.1\",\"userAgent\":\"Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36\",\"device\":\"mobile\",\"browser\":\"Chrome\",\"platform\":\"Android\"}', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', '2026-07-05 15:57:30', '2026-07-05 15:57:30'),
(252, 2, 'login', 'User logged in via trusted device', '{\"entity\":\"user\",\"userId\":2,\"userEmail\":\"sisonjohnalbert0423@gmail.com\",\"device\":\"mobile\",\"browser\":\"Chrome\",\"platform\":\"Android\"}', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36', '2026-07-05 15:57:38', '2026-07-05 15:57:38'),
(253, 2, 'delete', 'Deleted user irishortiz01@gmail.com', '{\"entity\":\"user\",\"deletedUserId\":\"22\",\"deletedUserEmail\":\"irishortiz01@gmail.com\",\"deleterId\":2,\"device\":\"Desktop\",\"browser\":\"Edge\",\"platform\":\"Windows\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36 Edg/150.0.0.0', '2026-07-05 15:57:54', '2026-07-05 15:57:54');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `departmentName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `departmentName`, `createdAt`, `updatedAt`) VALUES
(1, 'FAD', '2026-07-04 12:56:07', '2026-07-04 12:56:07'),
(2, 'Legal', '2026-07-04 12:56:07', '2026-07-04 12:56:07'),
(3, 'Corporate Planning', '2026-07-04 12:56:07', '2026-07-04 12:56:07'),
(4, 'IAO', '2026-07-04 12:56:07', '2026-07-04 12:56:07');

-- --------------------------------------------------------

--
-- Table structure for table `passwordresets`
--

CREATE TABLE `passwordresets` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `expiresAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `resetTokenHash` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `passwordresets`
--

INSERT INTO `passwordresets` (`id`, `userId`, `expiresAt`, `usedAt`, `createdAt`, `updatedAt`, `resetTokenHash`) VALUES
(1, 2, '2026-07-04 17:07:08', '2026-07-04 16:09:07', '2026-07-04 16:07:08', '2026-07-04 16:09:07', NULL),
(2, 2, '2026-07-04 17:10:11', '2026-07-04 16:10:33', '2026-07-04 16:10:11', '2026-07-04 16:10:33', NULL),
(3, 2, '2026-07-04 17:10:33', '2026-07-04 16:11:25', '2026-07-04 16:10:33', '2026-07-04 16:11:25', NULL),
(4, 2, '2026-07-04 17:11:25', '2026-07-04 16:14:48', '2026-07-04 16:11:25', '2026-07-04 16:14:48', NULL),
(5, 2, '2026-07-04 17:14:48', '2026-07-04 16:15:11', '2026-07-04 16:14:48', '2026-07-04 16:15:11', NULL),
(6, 2, '2026-07-04 17:15:11', '2026-07-04 16:19:26', '2026-07-04 16:15:11', '2026-07-04 16:19:26', NULL),
(7, 2, '2026-07-04 17:19:26', '2026-07-04 16:20:07', '2026-07-04 16:19:26', '2026-07-04 16:20:07', NULL),
(8, 2, '2026-07-04 17:22:01', '2026-07-04 16:22:24', '2026-07-04 16:22:01', '2026-07-04 16:22:24', NULL),
(9, 2, '2026-07-04 17:28:29', '2026-07-04 16:29:04', '2026-07-04 16:28:29', '2026-07-04 16:29:04', NULL),
(10, 2, '2026-07-05 05:39:08', '2026-07-05 04:39:34', '2026-07-05 04:39:08', '2026-07-05 04:39:34', NULL),
(11, 2, '2026-07-05 05:40:46', '2026-07-05 04:41:01', '2026-07-05 04:40:46', '2026-07-05 04:41:01', NULL),
(12, 2, '2026-07-05 05:41:01', '2026-07-05 04:41:41', '2026-07-05 04:41:01', '2026-07-05 04:41:41', NULL),
(13, 2, '2026-07-05 05:45:44', '2026-07-05 04:46:18', '2026-07-05 04:45:44', '2026-07-05 04:46:18', NULL),
(14, 2, '2026-07-05 05:50:17', '2026-07-05 04:51:07', '2026-07-05 04:50:17', '2026-07-05 04:51:07', NULL),
(15, 2, '2026-07-05 06:03:43', '2026-07-05 05:04:42', '2026-07-05 05:03:43', '2026-07-05 05:04:42', '980f15768f1362b068027a826ed1c14b9f317d7dda61f50dff71a3ccf5fb2ccd'),
(16, 2, '2026-07-05 07:22:27', '2026-07-05 06:31:34', '2026-07-05 06:22:27', '2026-07-05 06:31:34', 'c6015656b9e5703a09d51af3520db64d1398a32c73274ef9ade37f729b6acfd7'),
(20, 2, '2026-07-05 16:25:34', '2026-07-05 15:47:24', '2026-07-05 15:25:34', '2026-07-05 15:47:24', 'e444f71bbe1bcb44e61590335cf6d0a14ab61b8eb232a92fcfec53ab89f2dc89'),
(21, 2, '2026-07-05 16:47:24', '2026-07-05 15:53:15', '2026-07-05 15:47:24', '2026-07-05 15:53:15', 'c266bcbe87f28602996219190483a8bd2b81572cac562097f4cdfe5a6d8342fa'),
(22, 2, '2026-07-05 16:53:15', NULL, '2026-07-05 15:53:15', '2026-07-05 15:53:15', '91b52cc11d8a343ca07251256bd104db71fe7f31cebbe3592e96975e3720e49e');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `label`, `createdAt`, `updatedAt`) VALUES
(1, 'accounts.manage', 'Manage Accounts', '2026-06-22 05:47:37', '2026-07-03 14:21:32'),
(2, 'accounts.update', 'Update Accounts', '2026-06-22 05:47:37', '2026-07-03 14:50:50'),
(3, 'accounts.delete', 'Delete Accounts', '2026-06-22 05:47:37', '2026-07-03 14:50:40'),
(4, 'roles.manage', 'Manage Roles', '2026-06-22 05:47:37', '2026-06-22 05:47:37'),
(5, 'permissions.manage', 'Manage Permissions', '2026-06-22 05:47:37', '2026-06-22 05:47:37'),
(6, 'documents.manage', 'Manage Documents', '2026-07-02 02:33:24', '2026-07-03 15:02:33'),
(7, 'audit_logs.view', 'View Audit Logs', '2026-07-02 02:33:24', '2026-07-02 02:33:24'),
(8, 'roles.create', 'Create Roles', '2026-07-02 09:32:56', '2026-07-02 09:32:56'),
(9, 'roles.update', 'Update Roles', '2026-07-02 09:32:56', '2026-07-02 09:32:56'),
(10, 'roles.delete', 'Delete Roles', '2026-07-02 09:32:56', '2026-07-02 09:32:56'),
(11, 'permissions.create', 'Create Permissions', '2026-07-02 09:32:56', '2026-07-02 09:32:56'),
(12, 'permissions.update', 'Update Permissions', '2026-07-02 09:32:56', '2026-07-02 09:32:56'),
(13, 'permissions.delete', 'Delete Permissions', '2026-07-02 09:32:56', '2026-07-02 09:32:56'),
(14, 'accounts.create', 'Create Accounts', '2026-07-03 08:52:33', '2026-07-03 14:50:31'),
(17, 'system_settings.manage', 'Manage System Settings', '2026-07-05 12:25:40', '2026-07-05 12:25:40');

-- --------------------------------------------------------

--
-- Table structure for table `rolepermissions`
--

CREATE TABLE `rolepermissions` (
  `roleId` int(11) NOT NULL,
  `permissionId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rolepermissions`
--

INSERT INTO `rolepermissions` (`roleId`, `permissionId`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2026-07-03 15:34:05', '2026-07-03 15:34:05'),
(1, 6, '2026-07-03 15:12:04', '2026-07-03 15:12:04'),
(1, 17, '2026-07-05 12:58:12', '2026-07-05 12:58:12'),
(3, 1, '2026-06-22 12:02:41', '2026-06-22 12:02:41'),
(3, 2, '2026-06-22 12:13:23', '2026-06-22 12:13:23'),
(3, 3, '2026-07-02 09:28:52', '2026-07-02 09:28:52'),
(3, 4, '2026-06-30 09:48:11', '2026-06-30 09:48:11'),
(3, 5, '2026-07-02 09:28:52', '2026-07-02 09:28:52'),
(3, 6, '2026-07-02 04:53:47', '2026-07-02 04:53:47'),
(3, 7, '2026-07-05 07:04:15', '2026-07-05 07:04:15'),
(3, 8, '2026-07-02 09:32:59', '2026-07-02 09:32:59'),
(3, 9, '2026-07-02 09:32:59', '2026-07-02 09:32:59'),
(3, 10, '2026-07-02 09:32:59', '2026-07-02 09:32:59'),
(3, 11, '2026-07-02 09:32:59', '2026-07-02 09:32:59'),
(3, 12, '2026-07-02 09:32:59', '2026-07-02 09:32:59'),
(3, 13, '2026-07-02 09:32:59', '2026-07-02 09:32:59'),
(3, 14, '2026-07-03 08:53:04', '2026-07-03 08:53:04'),
(3, 17, '2026-07-05 12:28:57', '2026-07-05 12:28:57');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Admin', '2026-06-22 06:22:24', '2026-06-22 06:22:24'),
(2, 'User', '2026-06-22 06:22:24', '2026-06-22 06:22:24'),
(3, 'Super Admin', '2026-06-22 06:22:50', '2026-06-22 06:22:50');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` int(11) NOT NULL,
  `UnitName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `UnitName`, `createdAt`, `updatedAt`) VALUES
(1, 'Human Resources', '2026-07-03 09:04:09', '2026-07-03 09:04:09'),
(2, 'Administrative', '2026-07-03 09:04:09', '2026-07-03 09:04:09'),
(3, 'Accounting', '2026-07-03 09:04:09', '2026-07-03 09:04:09'),
(4, 'Treasury', '2026-07-03 09:04:09', '2026-07-03 09:04:09'),
(5, 'Budget', '2026-07-03 09:04:09', '2026-07-03 09:04:09'),
(6, 'Information Technology', '2026-07-03 09:04:09', '2026-07-03 09:04:09');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `roleId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `status` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `lastLogin` datetime DEFAULT NULL,
  `firstName` varchar(255) NOT NULL,
  `middleName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) NOT NULL,
  `workgroupId` int(11) DEFAULT NULL,
  `unitsId` int(11) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `DepartmentId` int(11) DEFAULT NULL,
  `twoFactorEnabled` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `password`, `imageUrl`, `roleId`, `createdAt`, `updatedAt`, `status`, `lastLogin`, `firstName`, `middleName`, `lastName`, `workgroupId`, `unitsId`, `position`, `address`, `birthdate`, `DepartmentId`, `twoFactorEnabled`) VALUES
(2, 'sisonjohnalbert0423@gmail.com', 'TurkzyDev', '$2b$10$YoAbQ1oW2hTecRbmLgCqP.fxgZoqj6WcA/SW.rV6OL5A4a54H3R7C', '1783098613825-f1f3c43f-dc7f-461e-a917-1eb619090367.jpg', 3, '2026-06-22 09:58:24', '2026-07-05 15:57:38', 'Active', '2026-07-05 15:57:38', 'John Albert', 'Frias', 'Sison', 6, 6, 'Information Systems Researcher I', '2940 Orani Street, Tondo Manila', '2002-04-22', 3, 1),
(11, 'aabalos@ndc.gov.ph', 'aabalos', '$2b$10$edzkVPn7IimGZvqcUrub3uEd9XAnbtvOyIu2rNnztHAZJWS1tH8Pa', NULL, 1, '2026-07-04 17:12:50', '2026-07-05 13:42:44', 'Active', '2026-07-05 13:42:05', 'Ashly', 'Gemar', 'Abalos', 6, NULL, 'Corporate Planning Analyst', NULL, '2001-06-09', 3, 0),
(12, 'varenas@ndc.gov.ph', 'varenas', '$2b$10$ERop7nQOneE9SgMMb6InyuPTNTDWRrY6mWnb0WyjbkHZsZH3Gsj5q', NULL, 2, '2026-07-04 17:14:38', '2026-07-04 17:14:38', 'Active', NULL, 'Vanessa', 'Natividad', 'Arenas', 6, NULL, 'Private Secretary III', NULL, '1997-08-20', NULL, 0),
(13, 'jsazurin@ndc.gov.ph', 'jsazurin', '$2b$10$b8PRLnJwh7UcPVo2q2JfYeWSqNd2HeNt6T9VbxByeiKxTJs1UCtri', NULL, 1, '2026-07-04 17:16:25', '2026-07-05 07:14:05', 'Active', NULL, 'Joyce Ann', 'Salcedo', 'Azurin', 6, NULL, 'Department Manager III', NULL, '1989-10-13', 3, 0),
(14, 'lbaldovino@ndc.gov.ph', 'lbaldovino', '$2b$10$EQxCBnykV7A90hX5IGImYOvzaYms1hhQmBY/.IJUYPNcBEOdu9aHK', NULL, 2, '2026-07-04 17:19:26', '2026-07-04 17:19:26', 'Active', NULL, 'Lyka', 'Acosta', 'Baldovino', 4, 1, 'Administrative Services Officer II (HR Officer)', NULL, '1999-08-09', NULL, 0),
(15, 'mmiguelbancud@gmail.com', 'mbancud', '$2b$10$YqUGNpqcE7rsGrOLIiaeHeFIi5jkwesEtnSCOAyPmDumuStBFPt/6', NULL, 2, '2026-07-04 17:21:59', '2026-07-04 17:21:59', 'Active', NULL, 'Marc Miguel', 'Lozande', 'Bancud', 4, 2, 'Supervising Engineer A', NULL, '1998-08-06', NULL, 0),
(16, 'aldwinbermido@gmail.com', 'abermido', '$2b$10$XyEbn5eWI69aI3KmZg/COeo1OkTEu3ZCg.kSXyxuiPYR/Ih5ij8cC', NULL, 1, '2026-07-04 17:24:55', '2026-07-04 17:24:55', 'Active', NULL, 'Aldwin', 'Quimbo', 'Bermido', 6, 6, 'IT Officer', NULL, '1987-05-23', 3, 0),
(17, 'jbbordaje.ndc@gmail.com', 'jbordaje', '$2b$10$iHwlg0eNieK5l3ufURp3fuAiM48HG626Hj5yHFMrpMNyeuML5C9Yq', NULL, 2, '2026-07-04 17:26:37', '2026-07-04 17:26:37', 'Active', NULL, 'Jayzer', 'Babagay', 'Bordaje', 4, 1, 'Administrative Services Officer II (HR Assistant)', NULL, '2001-11-15', NULL, 0),
(18, 'vmbuenaventura@ndc.gov.ph', 'Vbuenaventura', '$2b$10$tMY2zOVYxFeDkFZMq4CX7uyzCcbHbL6oYuODVFoe7ldiOF8kB7iP6', NULL, 2, '2026-07-04 17:28:51', '2026-07-04 17:28:51', 'Active', NULL, 'Velayda', 'Manzano', 'Buenaventura', 1, NULL, 'Corporate Executive Officer II', NULL, '1965-10-10', NULL, 0),
(19, 'jisellecabero.ndc@gmail.com', 'jcabero', '$2b$10$jchHSXj0SIzqF89pch/BR./XzJDiqVQOISqmkfYE9PXyZYLcvBv/q', NULL, 2, '2026-07-05 12:00:09', '2026-07-05 12:00:09', 'Active', NULL, 'Jiselle', 'Gatpandan', 'Cabero', 4, 5, 'Administrative Services Officer II', NULL, '1995-05-25', NULL, 0),
(20, 'maryjoyvelarde2015@gmail.com', 'Mvelarde', '$2b$10$Gt.EQ8A76noCnWLxBE8HPu5YLkk1snDq0mxtXa38ugUMZw9GBy2v6', NULL, 1, '2026-07-05 12:02:05', '2026-07-05 12:02:05', 'Active', NULL, 'Mary Joy', 'Reyes', 'Velarde', 6, NULL, 'Corporate Planning Analyst', NULL, '2001-12-22', 3, 0),
(21, 'czannisgilhang@ndc.gov.ph', 'Cgilhang', '$2b$10$rgeQG6R1/4cfHtnxqNLh4epCZ13RZdXpFRTP954.MzojfV6k5QRXa', NULL, 1, '2026-07-05 12:04:32', '2026-07-05 12:04:32', 'Active', NULL, 'Czannis', 'De Castro', 'Gilhang', 4, NULL, 'Senior Planning Specialist', NULL, '1997-03-01', 3, 0);

-- --------------------------------------------------------

--
-- Table structure for table `workgroups`
--

CREATE TABLE `workgroups` (
  `id` int(11) NOT NULL,
  `workgroupName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `workgroups`
--

INSERT INTO `workgroups` (`id`, `workgroupName`, `createdAt`, `updatedAt`) VALUES
(1, 'Assets Management Group', '2026-07-03 08:42:47', '2026-07-03 08:42:47'),
(2, 'Business Development Group', '2026-07-03 08:42:47', '2026-07-03 08:42:47'),
(3, 'Corporate Communications Group', '2026-07-03 08:42:47', '2026-07-03 08:42:47'),
(4, 'Corporate Support Group', '2026-07-03 08:42:47', '2026-07-03 08:42:47'),
(5, 'Finance and Subsidiaries Group', '2026-07-03 08:42:47', '2026-07-03 08:42:47'),
(6, 'Office of the General Manager', '2026-07-03 08:42:47', '2026-07-03 08:42:47'),
(7, 'Special Projects Group', '2026-07-03 08:42:47', '2026-07-03 08:42:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activitylogs`
--
ALTER TABLE `activitylogs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `passwordresets`
--
ALTER TABLE `passwordresets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `resetTokenHash` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_2` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_3` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_4` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_5` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_6` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_7` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_8` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_9` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_10` (`resetTokenHash`),
  ADD UNIQUE KEY `resetTokenHash_11` (`resetTokenHash`),
  ADD KEY `userId` (`userId`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`),
  ADD UNIQUE KEY `name_54` (`name`),
  ADD UNIQUE KEY `name_55` (`name`),
  ADD UNIQUE KEY `name_56` (`name`),
  ADD UNIQUE KEY `name_57` (`name`);

--
-- Indexes for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD UNIQUE KEY `RolePermissions_permissionId_roleId_unique` (`roleId`,`permissionId`),
  ADD KEY `permissionId` (`permissionId`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`),
  ADD UNIQUE KEY `name_54` (`name`),
  ADD UNIQUE KEY `name_55` (`name`),
  ADD UNIQUE KEY `name_56` (`name`),
  ADD UNIQUE KEY `name_57` (`name`),
  ADD UNIQUE KEY `name_58` (`name`),
  ADD UNIQUE KEY `name_59` (`name`),
  ADD UNIQUE KEY `name_60` (`name`),
  ADD UNIQUE KEY `name_61` (`name`),
  ADD UNIQUE KEY `name_62` (`name`),
  ADD UNIQUE KEY `name_63` (`name`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `username_2` (`username`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `username_3` (`username`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `username_4` (`username`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `username_5` (`username`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `username_6` (`username`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `username_7` (`username`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `username_8` (`username`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `username_9` (`username`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `username_10` (`username`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `username_11` (`username`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `username_12` (`username`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `username_13` (`username`),
  ADD KEY `roleId` (`roleId`),
  ADD KEY `workgroupId` (`workgroupId`),
  ADD KEY `unitsId` (`unitsId`),
  ADD KEY `DepartmentId` (`DepartmentId`);

--
-- Indexes for table `workgroups`
--
ALTER TABLE `workgroups`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activitylogs`
--
ALTER TABLE `activitylogs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=254;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `passwordresets`
--
ALTER TABLE `passwordresets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `workgroups`
--
ALTER TABLE `workgroups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activitylogs`
--
ALTER TABLE `activitylogs`
  ADD CONSTRAINT `activitylogs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_11` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_13` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_21` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_25` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_27` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_28` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_29` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_30` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_31` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_32` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_33` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_34` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_35` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_36` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_37` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_38` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_39` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_40` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_41` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_42` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_43` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_44` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_45` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_46` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_47` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_48` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_49` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_50` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_51` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_52` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_53` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_54` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_55` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_56` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_57` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_58` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_59` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_60` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_61` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_62` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_63` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_64` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_65` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_66` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `activitylogs_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `passwordresets`
--
ALTER TABLE `passwordresets`
  ADD CONSTRAINT `passwordresets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_10` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_11` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_12` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_13` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_14` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_15` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_16` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_18` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_19` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_20` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_21` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_22` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_23` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_24` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_25` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_26` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_3` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_4` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_5` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_7` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_8` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passwordresets_ibfk_9` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `Users_DepartmentId_foreign_idx` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Users_unitsId_foreign_idx` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `Users_workgroupId_foreign_idx` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_10` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_100` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_101` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_102` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_103` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_104` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_105` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_106` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_107` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_108` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_109` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_11` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_110` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_111` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_112` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_113` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_114` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_115` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_116` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_117` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_118` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_119` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_12` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_120` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_121` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_122` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_123` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_124` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_125` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_126` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_127` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_128` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_129` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_13` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_130` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_131` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_132` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_133` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_134` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_135` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_136` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_137` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_138` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_139` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_14` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_140` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_141` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_142` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_143` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_144` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_145` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_146` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_147` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_148` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_149` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_15` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_150` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_151` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_152` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_153` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_154` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_155` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_156` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_157` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_158` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_159` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_16` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_160` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_161` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_162` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_163` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_164` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_165` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_166` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_167` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_168` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_169` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_17` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_170` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_171` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_172` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_173` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_174` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_175` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_176` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_177` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_178` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_179` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_18` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_180` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_181` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_182` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_183` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_184` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_185` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_186` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_187` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_188` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_189` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_19` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_190` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_191` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_192` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_193` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_194` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_195` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_196` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_197` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_198` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_199` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_20` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_200` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_201` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_202` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_203` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_204` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_205` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_206` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_207` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_208` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_209` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_21` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_210` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_211` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_212` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_213` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_214` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_215` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_216` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_217` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_218` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_219` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_22` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_220` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_221` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_222` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_223` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_224` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_225` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_226` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_227` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_228` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_229` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_23` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_230` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_231` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_232` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_233` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_234` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_235` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_236` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_237` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_238` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_239` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_24` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_240` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_241` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_242` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_243` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_244` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_245` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_246` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_247` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_248` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_249` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_25` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_250` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_251` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_252` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_253` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_254` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_255` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_256` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_257` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_258` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_259` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_26` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_260` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_261` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_262` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_263` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_264` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_265` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_266` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_267` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_268` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_269` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_27` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_270` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_271` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_272` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_273` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_274` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_275` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_276` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_277` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_278` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_279` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_28` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_280` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_281` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_282` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_283` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_284` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_285` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_286` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_287` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_288` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_289` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_29` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_290` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_291` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_292` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_293` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_294` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_295` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_296` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_297` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_298` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_299` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_30` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_300` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_301` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_302` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_303` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_304` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_305` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_306` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_307` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_308` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_309` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_31` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_310` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_311` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_312` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_313` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_314` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_315` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_316` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_317` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_318` FOREIGN KEY (`DepartmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_32` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_33` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_34` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_35` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_36` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_37` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_38` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_39` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_4` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_40` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_41` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_42` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_43` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_44` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_45` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_46` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_47` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_48` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_49` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_5` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_50` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_51` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_52` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_53` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_54` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_55` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_56` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_57` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_58` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_59` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_6` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_60` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_61` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_62` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_63` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_64` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_65` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_66` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_67` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_68` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_69` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_7` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_70` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_71` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_72` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_73` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_74` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_75` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_76` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_77` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_78` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_79` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_8` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_80` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_81` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_82` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_83` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_84` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_85` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_86` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_87` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_88` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_89` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_9` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_90` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_91` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_92` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_93` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_94` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_95` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_96` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_97` FOREIGN KEY (`workgroupId`) REFERENCES `workgroups` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_98` FOREIGN KEY (`unitsId`) REFERENCES `units` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_99` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
